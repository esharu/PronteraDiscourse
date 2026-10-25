# Prontera — Discourse Theme

Brand skin for the Prontera community forum on the root domain
(**prontera.info**), the DiscourseConnect SSO master for the whitelabel
Ragnarok Online hubs. It mirrors the Nuxt hub design system 1:1 — the same
color tokens, the same Cinzel/Inter typography and the same card/badge
vocabulary — so the forum and the game hubs read as one product.

The design is derived from the hub sources in
[`esharu/printera`](https://github.com/esharu/printera):
`docs/branding.md`, `app/assets/css/tokens.css` and `app/assets/css/ui.css`.

## This repo = the main theme (skin)

Discourse installs one theme per repository root, so the skin and the
homepage portal live in **two repos**:

| Repo | Discourse artifact | Install as |
|---|---|---|
| **esharu/PronteraDiscourse** (this repo) | **Prontera** — the main theme (skin) | Theme |
| [**esharu/PronteraDiscoursePortal**](https://github.com/esharu/PronteraDiscoursePortal) | **Prontera Portal** — homepage hero + RO3/ROZ instance cards | Component of the Prontera theme |

## Install

Both are installed via **Admin → Customize → Themes → Install → From a git
repository** (use the `.git` clone URL, not a GitHub `/tree/...` browser URL).

1. **Theme (this repo):**
   ```
   https://github.com/esharu/PronteraDiscourse.git
   ```
   It ships two color schemes — **Prontera Dark** (default) and **Prontera
   Light**. Set Prontera Dark as the default scheme and Prontera Light as the
   light-mode scheme so Discourse's built-in dark/light toggle matches the
   hub ("Dark ist Default, Light per Toggle", `docs/branding.md`).
2. **Portal component:**
   ```
   https://github.com/esharu/PronteraDiscoursePortal.git
   ```
   Then add it as a component of the Prontera theme under *Included
   components*.

## Design mapping

Color tokens (`docs/branding.md`) → Discourse color scheme:

| Prontera token | Hex | Discourse role |
|---|---|---|
| Midnight | `#1d2d3f` | `header_background` (both schemes) |
| Parchment | `#f4ead2` | `primary` (dark) / `header_primary` |
| Verdigris | `#37877b` | `tertiary` (links, buttons, active) |
| Gold | `#d9a441` | `highlight` / dates |
| Banner Red | `#c4453c` | `danger` + RO3 seal |
| Poring | `#f08ba5` | `love` |
| bg (dark) | `#16232f` | `secondary` (dark) |
| bg (light) | `#efe7d2` | `secondary` (light) |

Typography rule (kept from the hub's lesson learned): **Cinzel** is used only
for the brand wordmark, the hero and static-page H1 — **never** on topic
titles or list rows, which stay in **Inter** for readability.

## Features

- **Network shell** — one navigation across the forum and both hubs, built
  from Glimmer components in plugin outlets (no DOM injection):
  a network bar above the header (game switch RO3 / Ragnarok Zero + hub link),
  the Prontera brand lockup in place of the logo, the hub's main navigation
  beside it and the hub's *Community* sub-navigation (Overview · Forum ·
  Guilds · Raids & Parties · Marketplace) under the header. The game of a page
  is read from its root category; inside a game the accent switches to that
  hub's (gold for Ragnarok Zero, banner red for RO3).
- **Database links in posts** — links to hub entity pages (items, monsters,
  maps, NPCs on either hub) become typed chips with a hovercard; a onebox of
  such a page — e.g. the context post the hub writes when it opens a
  discussion topic — becomes a database card. Data from the hub's public
  `/api/portal/entity`; without it the post stays exactly as rendered.
- **Hub typography** — topic titles in ink (unread) / dim (read), text tokens
  taken from the hub's `tokens.css`.
- **Umami** — self-hosted analytics + recorder as an opt-in Klaro service.
- **Cookie consent (Klaro!)** — open-source CMP. Analytics load **only** after
  consent; a *Cookie settings* link in the footer re-opens it. Declared
  services: *Essential (Discourse)* and *Discord login* (necessary, always on),
  *Google Analytics 4* (opt-in), *Discord widget* (opt-in, social).
- **GA4** — loaded via `gtag.js` through the Klaro `google-analytics` service,
  so nothing tracks before consent.
- **Self-hosted fonts** — Cinzel + Inter (variable woff2) ship as theme assets;
  no request to Google Fonts (avoids the German GDPR issue with
  `fonts.gstatic.com`).
- **Legal footer** — the non-commercial fan-project disclaimer, site-wide.

## Settings

Interactive accent (Verdigris / Banner Red / Gold), parchment texture, the
network shell (network bar and hub navigation on/off, default game, root
category IDs, hub URLs, labels, marketplace flags), cookie consent (enable),
**`ga4_measurement_id`** (e.g. `G-XXXX`), Umami host + website ID, and the
privacy-policy URL.

> **Important:** put your GA4 ID in `ga4_measurement_id` and keep Discourse's
> built-in Google Analytics setting **empty**, otherwise analytics load
> ungated (bypassing consent).

### Klaro is self-hosted

`assets/klaro.js` (Klaro 0.7.21, CSS bundled) ships with the theme and is
declared in `about.json` under `assets.klaro`. It is loaded from the forum
origin via `discourse/lib/load-script` in the `prontera-consent`
api-initializer (`settings.theme_uploads.klaro`), so Discourse's
Content-Security-Policy does not block it and no external CDN request is made.
The banner is initialised explicitly with `klaro.setup()`. To upgrade Klaro,
replace that file.

### Fonts are self-hosted

`assets/fonts/cinzel.woff2` and `assets/fonts/inter.woff2` (variable, latin) are
declared as `assets.cinzel` / `assets.inter` and `@font-face`'d in
`common.scss` via `$cinzel` / `$inter`. Latin covers German umlauts; add the
`latin-ext` subset if you need more glyphs.

### Wiring an embedded Discord widget to consent

The `discord-widget` service is opt-in but inert until you embed a widget. To
gate an embed, mark its script/iframe with `data-name="discord-widget"` and
`data-type="text/plain"` so Klaro shows a placeholder until the visitor
consents (Klaro contextual blocking).

## Local development

There is no build step. Edit the SCSS / `.gjs` / YAML and re-import (or use
the Discourse Theme CLI `discourse_theme watch` for live reload against a
dev forum).
