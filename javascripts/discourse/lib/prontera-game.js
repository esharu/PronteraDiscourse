// Which hub a forum page belongs to, and everything the shell needs to
// point at that hub.
//
// The forum is shared by both whitelabel hubs (ro3 / roz). A page belongs to
// a game when its category — or its topic's category — sits under that
// game's root category (theme settings *_root_category_id). Pages outside
// both fall back to the game the visitor looked at last, then default_game.
//
// `settings` is the theme-settings global injected by Discourse.
/* global settings */

const LAST_GAME_KEY = "prontera:last-game";

// Hub routes, mirroring app/utils/navigation.ts in esharu/printera.
export const HUB_NAV = [
  { key: "home", label: "Home", path: "/" },
  { key: "database", label: "Database", path: "/database" },
  { key: "map", label: "Map", path: "/maps" },
  { key: "guides", label: "Guides & Info", path: "/guides" },
  { key: "tools", label: "Tools", path: "/tools" },
  { key: "builds", label: "Build Planner", path: "/builds" },
  { key: "community", label: "Community", path: "/community" },
];

function rootCategory(router) {
  let route = router.currentRoute;
  while (route) {
    const category = route.attributes?.category;
    if (category) {
      let root = category;
      while (root.parentCategory) {
        root = root.parentCategory;
      }
      return root;
    }
    route = route.parent;
  }
  return null;
}

function readLastGame() {
  try {
    const value = window.localStorage.getItem(LAST_GAME_KEY);
    return value === "roz" || value === "ro3" ? value : null;
  } catch {
    return null;
  }
}

function writeLastGame(game) {
  try {
    window.localStorage.setItem(LAST_GAME_KEY, game);
  } catch {
    // Private mode / blocked storage: the fallback is default_game.
  }
}

// The game a page belongs to, or null when it belongs to neither.
// Reading router.currentURL keeps callers' getters tracked across navigation.
export function pageGame(router) {
  // eslint-disable-next-line no-unused-expressions
  router.currentURL;
  const root = rootCategory(router);
  if (!root) {
    return null;
  }
  if (root.id === settings.roz_root_category_id) {
    return "roz";
  }
  if (root.id === settings.ro3_root_category_id) {
    return "ro3";
  }
  return null;
}

// The game the shell points at: the page's own, else the last one seen.
export function contextGame(router) {
  const game = pageGame(router);
  if (game) {
    writeLastGame(game);
    return game;
  }
  return readLastGame() || settings.default_game || "roz";
}

export function gameInfo(game) {
  const ro3 = game === "ro3";
  const base = (ro3 ? settings.ro3_url : settings.roz_url).replace(/\/+$/, "");
  return {
    key: game,
    label: ro3 ? settings.ro3_label : settings.roz_label,
    seal: ro3 ? "3" : "Z",
    hubUrl: base,
    forumPath: `/c/${ro3 ? settings.ro3_root_category_id : settings.roz_root_category_id}`,
    marketplace: ro3 ? settings.ro3_marketplace : settings.roz_marketplace,
  };
}
