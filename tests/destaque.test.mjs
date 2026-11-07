// A faixa de lançamento posta pelo servidor (functions/_lib/destaque-servidor.js). O que
// falha calado: dado de fora virando HTML ou link, a página quebrando quando o
// fotos cai, e o navegador preso numa cópia sem a faixa (ETag).
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { limpaDestaque, faixaHTML, injeta, comDestaque, DESTAQUE_FONTE } from '../functions/_lib/destaque-servidor.js';

const ATIVO = { ativo: true, slug: 'entrenos2026', titulo: 'Entre Nós', linha: 'Turma 2026 · Colégio Santa Cruz', url: 'https://entrenos2026.com/' };
const PAGINA = '<!doctype html><html><head><title>x</title></head><body class="a">\n<main>oi</main></body></html>';

const realFetch = globalThis.fetch;
let resposta;
let pedidos;
beforeEach(() => {
  pedidos = [];
  resposta = () => Response.json(ATIVO);
  globalThis.fetch = async (u) => { pedidos.push(String(u)); return resposta(); };
  globalThis.caches = undefined;
});
afterEach(() => { globalThis.fetch = realFetch; });

describe('limpaDestaque', () => {
  test('só https de álbum conhecido, sem usuário nem porta', () => {
    assert.equal(limpaDestaque(ATIVO).url, 'https://entrenos2026.com/');
    for (const url of ['javascript:alert(1)', 'http://entrenos2026.com/', 'https://evil.example/', 'https://entrenos2026.com.evil.example/', 'https://a@entrenos2026.com/', 'https://entrenos2026.com:81/']) {
      assert.deepEqual(limpaDestaque({ ...ATIVO, url }), { ativo: false }, url);
    }
    for (const d of [null, { ativo: false }, { ...ATIVO, ativo: 'sim' }, { ...ATIVO, titulo: '' }]) assert.deepEqual(limpaDestaque(d), { ativo: false });
  });
});

describe('a faixa', () => {
  test('texto escapado: nada do fotos vira HTML', () => {
    const h = faixaHTML(limpaDestaque({ ...ATIVO, titulo: '<img src=x onerror=alert(1)>', linha: '"><script>' }));
    assert.doesNotMatch(h, /<img|<script|onerror=alert[^)]*\)>/);
    assert.match(h, /&lt;img src=x onerror=alert\(1\)&gt;/);
  });

  test('vai logo depois do <body> e o CSS no <head>; sem script nem estilo inline', () => {
    const h = injeta(PAGINA, limpaDestaque(ATIVO));
    assert.match(h, /<link rel="stylesheet" href="\/destaque.css">\n<\/head><body class="a"><input type="checkbox" id="lfc-dq-x"/);
    assert.match(h, /<b>Entre Nós<\/b> · o álbum está no ar/);
    assert.doesNotMatch(h.replace(PAGINA.slice(0, 20), ''), /<script|style="|\son[a-z]+=/);
    assert.equal(injeta(h, limpaDestaque(ATIVO)), h, 'não põe duas vezes');
    assert.equal(injeta('<p>sem body</p>', limpaDestaque(ATIVO)), '<p>sem body</p>');
    assert.equal(injeta(PAGINA, { ativo: false }), PAGINA);
  });
});

describe('comDestaque', () => {
  const pagina = (status = 200, tipo = 'text/html; charset=utf-8') => async (req) => {
    pagina.ultimo = req;
    return new Response(status === 304 ? null : PAGINA, { status, headers: { 'Content-Type': tipo, ETag: '"abc"', 'Content-Length': String(PAGINA.length) } });
  };

  test('álbum lançado: a faixa entra, e a revalidação (ETag) sai', async () => {
    const proximo = pagina();
    const req = new Request('https://keys.lucafchala.com/', { headers: { 'If-None-Match': '"abc"' } });
    const res = await comDestaque(req, proximo, () => {});
    assert.equal(pagina.ultimo.headers.get('If-None-Match'), null);
    assert.equal(res.headers.get('ETag'), null);
    assert.match(await res.text(), /class="lfc-dq"/);
    assert.deepEqual(pedidos, [DESTAQUE_FONTE]);
  });

  test('antes do lançamento, fotos fora ou lixo: a página intacta', async () => {
    for (const r of [() => Response.json({ ativo: false }), () => { throw new Error('rede'); }, () => new Response('x', { status: 503 }), () => new Response('não é json')]) {
      resposta = r;
      const res = await comDestaque(new Request('https://keys.lucafchala.com/'), pagina(), () => {});
      assert.equal(res.status, 200);
      assert.equal(await res.text(), PAGINA);
    }
  });

  test('não mexe em POST, em 404 nem em arquivo que não é HTML', async () => {
    let res = await comDestaque(new Request('https://x.lucafchala.com/', { method: 'POST' }), pagina(), () => {});
    assert.equal(await res.text(), PAGINA);
    res = await comDestaque(new Request('https://x.lucafchala.com/a.txt'), pagina(200, 'text/plain'), () => {});
    assert.equal(await res.text(), PAGINA);
    res = await comDestaque(new Request('https://x.lucafchala.com/'), pagina(404), () => {});
    assert.equal(res.status, 404);
    assert.equal(pedidos.length, 0);
  });

  test('cache: uma pergunta ao fotos a cada 5 min, não por visita', async () => {
    const m = new Map();
    globalThis.caches = { default: { async match(k) { const x = m.get(k); return x ? x.clone() : undefined; }, async put(k, r) { m.set(k, r.clone()); } } };
    const pend = [];
    await comDestaque(new Request('https://keys.lucafchala.com/'), pagina(), (p) => pend.push(p));
    await Promise.all(pend);
    await comDestaque(new Request('https://keys.lucafchala.com/'), pagina(), () => {});
    assert.equal(pedidos.length, 1);
  });
});
