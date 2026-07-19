# Prontera Portal (Discourse theme component)

Homepage hero + RO3/ROZ instance cards for the Prontera root domain. Install
as a **component** of the parent *Prontera* theme (it relies on the brand
tokens the theme declares, with hex fallbacks so it degrades safely on its
own).

- Renders only on the site homepage (`/`) and only while `portal_enabled` is on.
- Injected above the discovery list via `above-main-container`.
- All copy and both cards (name, tagline, URL) are theme settings — see
  `settings.yml`.

See the repo root `README.md` for install instructions.
