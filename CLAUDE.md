# CLAUDE.md — keys.lucafchala.com

Static page with Luca's SSH and PGP public keys. No build step; Cloudflare Pages deploys `main`.

- **The keys are data, not decoration.** `pgp.asc` and `ssh.pub` are the canonical copies. The page repeats them (`#key-pgp`, `#key-ssh`) and their fingerprints (`#pgp-fp`, `#ssh-fp`). CI recomputes both fingerprints from the key bytes, so never "fix" a fingerprint by hand — change the key file and let CI tell you what the fingerprint is.
- **Other copies of the PGP key:** `paste.lucafchala.com/pastes.json` (`pgp` paste) and `proof.lucafchala.com/pgp.asc`. Keep all three identical.
- **CSP is `script-src 'self'`:** no inline scripts, no `on*=`. Behaviour is in `keys.js` (copy buttons via `data-copy-from` / `data-copy-text`); theme and language are in `theme.js` (`window.lfPrefs`, shared `lf_*` cookies). Strings go in the `pt`/`en` objects in `keys.js`; elements use `data-i18n` / `data-i18n-html` / `data-i18n-attr`.
- **Every `<script>` has `data-cfasync="false"`** (Cloudflare Rocket Loader).
- **Keep the word `Chaves` in the page** — status.lucafchala.com checks for it.
- **Scrollable code blocks** have `tabindex="0"` so keyboard users can scroll them (axe `scrollable-region-focusable`).
- **SEO:** the page carries a `ProfilePage` JSON-LD block whose `Person` has `@id` `https://lucafchala.com/#person` — the same entity the homepage declares, so search engines join the two. Don't change that `@id` without changing lucafchala.com. JSON-LD is data, not script: CI's inline-script check allows `application/ld+json` only. `sitemap.xml` and the `Sitemap:` line in `robots.txt` list the single page; bump `lastmod` when the page changes.
