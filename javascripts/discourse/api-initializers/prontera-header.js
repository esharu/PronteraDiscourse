import { apiInitializer } from "discourse/lib/api";
import PronteraBrand from "../components/prontera-brand";
import PronteraCommunityNav from "../components/prontera-community-nav";
import PronteraHubNav from "../components/prontera-hub-nav";
import PronteraNetworkBar from "../components/prontera-network-bar";
import { pageGame } from "../lib/prontera-game";

// The network shell: one navigation across the forum and both hubs.
//
//  - `above-site-header`: network bar (game switch + hub link)
//  - `home-logo` (wrapper): Prontera brand lockup with the page's game
//  - `home-logo__after`: the hub's main navigation
//  - `below-site-header`: the hub's Community sub-navigation
//
// All of these are Glimmer components in plugin outlets — no DOM
// injection, so header rewrites in core cannot silently break them.
//
// `settings` is the theme-settings global injected by Discourse.
/* global settings */

export default apiInitializer("1.14.0", (api) => {
  api.renderInOutlet("home-logo", PronteraBrand);

  if (settings.network_bar_enabled) {
    api.renderInOutlet("above-site-header", PronteraNetworkBar);
  }

  if (settings.hub_nav_enabled) {
    api.renderInOutlet("home-logo__after", PronteraHubNav);
    api.renderInOutlet("below-site-header", PronteraCommunityNav);
  }

  // Game-scoped accent: inside RO Zero Global the shell turns gold, inside
  // Ragnarok Online 3 banner red — the same accent the matching hub uses.
  const router = api.container.lookup("service:router");
  api.onPageChange(() => {
    const game = pageGame(router);
    if (game) {
      document.documentElement.setAttribute("data-prontera-game", game);
    } else {
      document.documentElement.removeAttribute("data-prontera-game");
    }
  });

  // Footer "Cookie settings" button → re-open Klaro.
  document.addEventListener("click", (e) => {
    const btn =
      e.target.closest && e.target.closest(".prontera-footer__cookie-settings");
    if (btn && window.klaro && typeof window.klaro.show === "function") {
      e.preventDefault();
      window.klaro.show();
    }
  });
});
