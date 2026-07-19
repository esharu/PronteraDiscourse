# Prontera — Discourse Theme

Brand skin for the Prontera community forum on the root domain
(**prontera.info**), the DiscourseConnect SSO master for the whitelabel
Ragnarok Online hubs. It mirrors the Nuxt hub design system 1:1 — the same
color tokens, the same Cinzel/Inter typography and the same card/badge
vocabulary — so the forum and the game hubs read as one product.

The design is derived from the hub sources in
[`esharu/printera`](https://github.com/esharu/printera):
`docs/branding.md`, `app/assets/css/tokens.css` and `app/assets/css/ui.css`.

## What's in here

| Path        | Discourse artifact | Install as |
|-------------|--------------------|------------|
| `/` (root)  | **Prontera** — the main theme (skin) | Theme |
| `/portal`   | **Prontera Portal** — homepage hero + RO3/ROZ instance cards | Component of the Prontera theme |

Two separate installs from **one** repo.

## Install

Both are installed via **Admin → Customize → Themes → Install → From a git repository**.

1. **Theme:** import `https://github.com/esharu/pronteradiscourse`
   (root `about.json`). It ships two color schemes — **Prontera Dark**
   (default) and **Prontera Light**. Set Prontera Dark as the default
   scheme and Prontera Light as the light-mode scheme so Discourse's
   built-in dark/light toggle matches the hub ("Dark ist Default, Light per
   Toggle", `docs/branding.md`).
2. **Portal component:** import the same repo again, this time pointing at
   the **`portal`** subdirectory (the "Advanced" install lets you specify a
   subfolder), then add it as a component of the Prontera theme under
   *Included components*.

> Import from a subfolder is supported by Discourse's git installer via the
> subfolder field. If your version predates that, split `portal/` into its
> own repo — it is fully self-contained.

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

## Settings

**Theme:** interactive accent (Verdigris / Banner Red / Gold), parchment
texture toggle, brand wordmark toggle.

**Portal:** all hero copy and both instance cards (name, tagline, URL,
enable/disable) are editable — no code changes needed to retune the
homepage.

## Local development

There is no build step. Edit the SCSS / `.gjs` / YAML and re-import (or use
the Discourse Theme CLI `discourse_theme watch` for live reload against a
dev forum).
