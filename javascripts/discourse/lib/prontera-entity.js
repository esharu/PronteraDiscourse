// Hub database links in forum posts: recognise them, fetch their preview.
//
// A link to a hub entity page (https://roz.prontera.info/items/amulet) is
// turned into a typed chip with a hovercard, and the context post the hub
// writes for a discussion topic into a database card. The data comes from
// the hub's public GET /api/portal/entity (esharu/printera,
// server/api/portal/entity.get.ts): name, image, up to three lines, URL.
//
// Everything degrades to the plain link: unknown host, unknown path, hub
// down or endpoint missing — the post looks exactly as Discourse rendered it.
//
// `settings` is the theme-settings global injected by Discourse.
/* global settings */

// Hub routes → portal entity types (the hub's own routes, see
// server/utils/search.ts in esharu/printera).
const ROUTE_TYPES = {
  items: "item",
  mobs: "mob",
  maps: "map",
  npcs: "npc",
};

const TYPE_LABELS = {
  item: "Item",
  mob: "Monster",
  map: "Map",
  npc: "NPC",
  quest: "Quest",
  skill: "Skill",
  set: "Set",
  article: "Guide",
  page: "Page",
};

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,119}$/i;

function hubOrigins() {
  const origins = {};
  for (const [game, raw] of [
    ["ro3", settings.ro3_url],
    ["roz", settings.roz_url],
  ]) {
    try {
      origins[new URL(raw).origin] = game;
    } catch {
      // unset or malformed setting: that hub is simply not recognised
    }
  }
  return origins;
}

// { game, type, slug, origin } for a hub entity URL, else null.
export function parseHubEntityUrl(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  const game = hubOrigins()[url.origin];
  if (!game) {
    return null;
  }
  const [, section, slug, ...rest] = url.pathname.split("/");
  const type = ROUTE_TYPES[section];
  if (!type || !slug || rest.length || !SLUG_RE.test(slug)) {
    return null;
  }
  return { game, type, slug, origin: url.origin };
}

export function typeLabel(type) {
  return TYPE_LABELS[type] || "Entry";
}

const cache = new Map();

// The preview for a parsed hub link; resolves to null when unavailable.
// One request per entity per page load, shared by every chip and card.
export function fetchEntityPreview({ origin, type, slug }) {
  const key = `${origin}|${type}|${slug}`;
  if (!cache.has(key)) {
    const params = new URLSearchParams({ type, slug });
    cache.set(
      key,
      fetch(`${origin}/api/portal/entity?${params}`, { credentials: "omit" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => (data && typeof data.name === "string" ? data : null))
        .catch(() => null)
    );
  }
  return cache.get(key);
}

// Only https images from the preview end up in an <img src>.
export function safeImage(src) {
  return typeof src === "string" && src.startsWith("https://") ? src : null;
}
