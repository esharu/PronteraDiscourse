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

- **Network switcher** — the header logo is replaced by the Prontera brand
  switcher (emblem + wordmark + dropdown), mirroring the hub headers: hop
  between the RO3 / ROZ hubs and this board. URLs/labels are settings.
- **Hero logo** — on the homepage, the brand is enlarged while scrolled to the
  top and shrinks back on scroll (desktop only).
- **Cookie consent (Klaro!)** — open-source CMP. Analytics load **only** after
  consent; a *Cookie settings* link in the footer re-opens it.
- **GA4** — loaded via `gtag.js` through the Klaro `google-analytics` service,
  so nothing tracks before consent.
- **Legal footer** — the non-commercial fan-project disclaimer, site-wide.

## Settings

Interactive accent (Verdigris / Banner Red / Gold), parchment texture, brand
wordmark, hero-logo enlarge + height, the network switcher (enable, hub URLs,
labels), cookie consent (enable), **`ga4_measurement_id`** (e.g. `G-XXXX`), and
the privacy-policy URL.

> **Important:** put your GA4 ID in `ga4_measurement_id` and keep Discourse's
> built-in Google Analytics setting **empty**, otherwise analytics load
> ungated (bypassing consent).

### Klaro is self-hosted

`assets/klaro.js` (Klaro 0.7.21, CSS bundled) ships with the theme and is
declared in `about.json` under `assets.klaro`. It loads from the forum origin
via `settings.theme_uploads.klaro`, so Discourse's Content-Security-Policy does
not block it and no external CDN request is made. To upgrade Klaro, replace
that file. The banner is initialised explicitly with `klaro.setup()` in
`head_tag.html` (auto-init via `data-config` does not work for dynamically
injected scripts).

## Local development

There is no build step. Edit the SCSS / `.gjs` / YAML and re-import (or use
the Discourse Theme CLI `discourse_theme watch` for live reload against a
dev forum).
