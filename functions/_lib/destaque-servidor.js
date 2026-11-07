// Aviso de lançamento de álbum do fotos, posto no HTML pelo SERVIDOR: nenhum
// JavaScript na página e nenhuma origem nova na CSP. É a versão para os sites
// de CSP rígida ou com dado sensível (keys, pays, proof, rg); os outros
// carregam o https://fotos.lucafchala.com/destaque.js. A explicação completa,
// e a lista de onde cada versão mora, está no docs/ALBUM.md do fotos ("Aviso
// nos outros sites"). Este arquivo é COPIADO igual em cada site: mudou aqui,
// mude nos outros.
//
// Como funciona: pergunta ao fotos (/api/destaque, guardado 5 min no cache da
// borda), e só se houver álbum lançado com "Destaque máximo no site" põe a
// faixa logo depois do <body> e o /destaque.css no <head>. O que vem do fotos
// é dado de fora: só passam título, selo e um link https para um endereço de
// álbum conhecido, tudo escapado. Qualquer falha devolve a página intacta.
//
// Fechar (o ×) é um checkbox com CSS, sem script: some na hora, mas volta na
// próxima visita.

export const DESTAQUE_FONTE = 'https://fotos.lucafchala.com/api/destaque';
// Domínio novo de álbum no fotos (DOMINIOS_DE_ALBUM) precisa entrar aqui.
export const HOSTS_DE_ALBUM = new Set(['fotos.lucafchala.com', 'entrenos2026.com']);
const CACHE_S = 300;
const CACHE_FALHA_S = 60;
const INATIVO = Object.freeze({ ativo: false });

const texto = (v, max) => (typeof v === 'string' ? v.replace(/[\p{Cc}\p{Cf}]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Só o que a faixa desenha, conferido. */
export function limpaDestaque(d) {
  if (!d || typeof d !== 'object' || d.ativo !== true) return INATIVO;
  const titulo = texto(d.titulo, 80);
  const linha = texto(d.linha, 80);
  let url;
  try { url = new URL(String(d.url)); } catch { return INATIVO; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !HOSTS_DE_ALBUM.has(url.hostname)) return INATIVO;
  if (!titulo) return INATIVO;
  return { ativo: true, titulo, linha, url: url.href };
}

export function faixaHTML(d) {
  return '<input type="checkbox" id="lfc-dq-x" class="lfc-dq-chk" aria-label="Fechar aviso">'
    + '<div class="lfc-dq" role="region" aria-label="Aviso">'
    + `<a class="lfc-dq-a" href="${esc(d.url)}"><span class="lfc-dq-k">${esc(d.linha || 'Novo álbum')}</span>`
    + `<span><b>${esc(d.titulo)}</b> · o álbum está no ar</span><span class="lfc-dq-c">Ver o álbum →</span></a>`
    + '<label class="lfc-dq-x" for="lfc-dq-x" aria-hidden="true">×</label></div>';
}

/** A página com a faixa (ou a mesma, se não houver onde pôr). */
export function injeta(html, d) {
  if (!d || !d.ativo || html.includes('class="lfc-dq"')) return html;
  const b = html.match(/<body\b[^>]*>/i);
  const h = html.search(/<\/head>/i);
  if (!b || h < 0 || h > b.index) return html;
  const fim = b.index + b[0].length;
  return html.slice(0, h) + '<link rel="stylesheet" href="/destaque.css">\n' + html.slice(h, fim) + faixaHTML(d) + html.slice(fim);
}

/** O destaque do fotos, com cache de 5 min na borda (1 min quando falha). */
export async function lerDestaque(waitUntil = () => {}) {
  const cache = globalThis.caches && caches.default;
  const chave = 'https://destaque.invalid/v1';
  if (cache) {
    try { const hit = await cache.match(chave); if (hit) return limpaDestaque(await hit.json()); } catch { /* segue sem cache */ }
  }
  let d = INATIVO;
  let ok = false;
  try {
    const r = await fetch(DESTAQUE_FONTE, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(2000) });
    if (r.ok) { d = limpaDestaque(await r.json()); ok = true; }
  } catch (e) {
    console.error('destaque: fotos não respondeu', e);
  }
  if (cache) {
    const s = ok ? CACHE_S : CACHE_FALHA_S;
    waitUntil(cache.put(chave, new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${s}` } })).catch(() => {}));
  }
  return d;
}

/**
 * Embrulha a resposta HTML da página. `proximo(req)` busca a página sem a
 * faixa (o asset estático). A validação condicional (ETag) sai do pedido e da
 * resposta: senão o navegador revalidaria a cópia sem a faixa e nunca a veria.
 */
export async function comDestaque(request, proximo, waitUntil) {
  if (request.method !== 'GET') return proximo(request);
  const pedido = new Request(request);
  pedido.headers.delete('If-None-Match');
  pedido.headers.delete('If-Modified-Since');
  const res = await proximo(pedido);
  if (res.status !== 200 || !(res.headers.get('Content-Type') || '').includes('text/html')) return res;
  const html = await res.text();
  let corpo = html;
  try { corpo = injeta(html, await lerDestaque(waitUntil)); } catch (e) { console.error('destaque: faixa não posta', e); }
  const out = new Response(corpo, res);
  out.headers.delete('Content-Length');
  out.headers.delete('ETag');
  out.headers.delete('Last-Modified');
  return out;
}
