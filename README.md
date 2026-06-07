# keys.lucafchala.com — scaffold

> **Status: to build.** Scaffold only (README + structure). The page is **not** generated yet.

Public keys page (SSH + PGP). The homepage footer **"Chave SSH ↗"** points here; the `url` hub grid lists it as **"keys — chaves SSH / PGP"**.

> ⚠️ **Not in the original migration checklist.** The exported plan intended PGP/SSH to live as pastes (`paste.lucafchala.com/pgp`, `/ssh`), but the **live homepage and `url` hub reference `keys.lucafchala.com`**. This scaffold follows the live site. Decide the canonical location (this repo vs. pastes vs. `proof`) and cross-link the rest.

## Architecture

- **Platform:** Cloudflare Pages, static, no build step.
- **Repo to create:** `lucafchala/keys.lucafchala.com` → Pages project → DNS `keys` CNAME.

## Source / data

- **PGP fingerprint:** `48E7 3F6F A287 1E7B 86EF EA64 8EC4 329A 369B 7B33` (UID `Luca F. Chala <luca@lucafchala.com>`).
- ⚠️ The **armored PGP public key** and the **SSH public key** were not committed in the export. Export and paste them in when building:
  - PGP: `gpg --armor --export luca@lucafchala.com`
  - SSH: your `~/.ssh/id_*.pub` (or `ssh-keygen -y -f <privkey>`)

## Structure to build

```
keys.lucafchala.com/
├── index.html    # two sections (SSH, PGP): key blocks in <pre>, fingerprint, "copy" buttons
└── icon.svg      # (optional)
```

### What `index.html` should do
- Show the **SSH** public key in a copyable `<pre>` block.
- Show the **PGP** fingerprint + armored key block with a copy button (same `copy key` pattern as `paste.lucafchala.com/pgp`).
- Theme toggle persisting `theme`; back-link to `lucafchala.com`.

## Design

Shared ecosystem design system. ➡️ <https://github.com/lucafchala/lucafchala.com#design-system>

## Deploy

1. Create repo `lucafchala/keys.lucafchala.com`, push the file(s).
2. Cloudflare Pages → no build, root output.
3. DNS: `keys` CNAME → Pages project URL.
