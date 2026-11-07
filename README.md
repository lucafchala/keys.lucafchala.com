# keys.lucafchala.com

> Luca F. Chala's public keys — SSH (Ed25519) and PGP (RSA 4096) — with fingerprints, raw downloads and copy-paste commands.

**Live:** [keys.lucafchala.com](https://keys.lucafchala.com) · **Stack:** static HTML/CSS/JS on Cloudflare Pages · **Build step:** none

Part of the [lucafchala.com ecosystem](https://github.com/lucafchala/lucafchala.com#the-ecosystem). Design system: [hub README](https://github.com/lucafchala/lucafchala.com#design-system).

---

## Keys

| | Value |
|---|---|
| **PGP** | RSA 4096, created 2023-11-07 |
| PGP fingerprint | `48E7 3F6F A287 1E7B 86EF  EA64 8EC4 329A 369B 7B33` |
| Encryption subkey | `7097 87C6 DD70 03F0 EB57  1C11 DA57 05DF 3308 654D` |
| Primary UID | Luca Ferriani Chala &lt;lfchala4@gmail.com&gt; |
| **SSH** | `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGpFgLiHgQtnLY86zenoG6Vmj0b7ZIR4kmcLilOoBujq` |
| SSH fingerprint | `SHA256:37h1wGX5+zl4ndPLh0UMpfjLiMn/nK3HJ64v8hiwlmo` |

## Use them

```bash
# PGP
curl -fsSL https://keys.lucafchala.com/pgp.asc | gpg --import
gpg --keyserver hkps://keys.openpgp.org --recv-keys 48E73F6FA2871E7B86EFEA648EC4329A369B7B33

# SSH — authorise on a server
curl -fsSL https://keys.lucafchala.com/ssh.pub >> ~/.ssh/authorized_keys
```

The signed statement tying these keys to Luca's accounts and domains is at [proof.lucafchala.com](https://proof.lucafchala.com).

## Files

| File | What |
|---|---|
| `index.html` | The page: key blocks, fingerprints, copy buttons, commands, collapsible full armored key |
| `pgp.asc` | Armored PGP public key (served as `text/plain`, CORS `*`) |
| `ssh.pub` | SSH public key (served as `text/plain`, CORS `*`) |
| `keys.css` | Styles |
| `keys.js` | PT/EN strings and copy buttons |
| `theme.js` | Theme + language bootstrap shared with the ecosystem (`lf_theme` / `lf_lang` cookies) |
| `icon.svg` | Site icon (a key) |
| `_headers` | CSP (`script-src 'self'`, `font-src 'self'`), HSTS, COOP/CORP, content types and CORS for the raw keys, `Link` hints |
| `fonts/` | Self-hosted Inter + JetBrains Mono (OFL) |

The page is PT-BR by default, with an EN toggle; the status monitor looks for the word `Chaves`.

## Updating a key

1. Replace `pgp.asc` (and/or `ssh.pub`).
2. Update `index.html`: the `<pre id="key-pgp">` content must equal `pgp.asc` (HTML-escaped), `#pgp-fp` the fingerprint, `#key-ssh` / `#ssh-fp` the SSH key and its `SHA256:` fingerprint.
3. Update the other copies of the PGP key: `paste.lucafchala.com/pastes.json` (the `pgp` paste; regenerate its page from the dash) and `proof.lucafchala.com/pgp.asc`. A new key also means re-signing the proof statement.

CI refuses anything inconsistent.

## CI (`.github/workflows/checks.yml`)

- `_headers` present, `node --check`, no inline scripts / `on*=` handlers.
- **Keys:**
  - `pgp.asc` is complete and its CRC24 checksum verifies;
  - the v4 fingerprint recomputed from the key bytes equals `48E73F6F…7B33`, and equals the fingerprint shown on the page;
  - the key shown on the page equals `pgp.asc`;
  - `ssh.pub` is a well-formed Ed25519 key, equal to the page's copy, and its SHA256 fingerprint matches the one displayed.

  A fingerprint typo has shipped once before (commit `0813545`); this makes it impossible.
- The status-monitor marker `Chaves` is present.

## Status

**In production.**

## Album launch notice (from fotos)

When fotos.lucafchala.com launches an album with **"Destaque máximo no site"** on, this page shows a blue card at the top of its column ("TURMA 2026 · COLÉGIO SANTA CRUZ **Entre Nós** · o álbum está no ar — Ver o álbum →"). Until then nothing changes.

- **Server-side, no script on the page.** A page whose whole job is to show key fingerprints must not run a script from another origin, and the CSP is `script-src 'self'`. `functions/_middleware.js` (only for `/`, see `_routes.json`) asks `https://fotos.lucafchala.com/api/destaque`, and if there's a launched album it inserts the strip right after `<body>` and `<link rel="stylesheet" href="/destaque.css">` in `<head>`. The CSP is unchanged.
- **fotos' answer is foreign data:** only the title, the label and an `https:` link to a known album host (`HOSTS_DE_ALBUM`: `fotos.lucafchala.com`, `entrenos2026.com`) pass, all HTML-escaped. fotos down, slow (2 s) or answering junk → the page is served untouched.
- **Cost:** one call to fotos per 5 min per Cloudflare location (edge cache; 1 min after a failure), and one Pages Functions invocation per visit to `/`.
- **ETag:** the function strips `If-None-Match`/`If-Modified-Since` and the response's `ETag`/`Last-Modified` on `/`, or a browser would keep revalidating its old copy without the strip.
- **Closing** (×) is a CSS checkbox: it hides the strip for that page view; it comes back on the next visit (there's no script to remember it). Hidden when printing.
- **Files:** `functions/_middleware.js`, `functions/_lib/destaque-servidor.js` (the logic — an **identical copy** lives in keys, pays and proof, and inline in rg's `_worker.js`; change all of them together), `destaque.css`, `_routes.json`, `tests/destaque.test.mjs`. The full picture across all sites is in fotos' `docs/ALBUM.md` ("Aviso nos outros sites").
- **A new album domain in fotos** (`DOMINIOS_DE_ALBUM`) must be added to `HOSTS_DE_ALBUM`, or the strip silently stays off for it.
