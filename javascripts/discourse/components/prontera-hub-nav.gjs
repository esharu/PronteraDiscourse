import Component from "@glimmer/component";
import { service } from "@ember/service";
import { contextGame, gameInfo, HUB_NAV } from "../lib/prontera-game";

// The hub's main navigation beside the logo (outlet `home-logo__after`), so
// the forum reads as the hub's "Community" section instead of a separate
// site. Links point at the hub of the page's game; Community is marked
// active because the forum is part of it.
export default class PronteraHubNav extends Component {
  @service router;

  get items() {
    const hub = gameInfo(contextGame(this.router));
    return HUB_NAV.map((item) => ({
      ...item,
      href: hub.hubUrl + item.path,
      active: item.key === "community",
    }));
  }

  <template>
    {{#unless @outletArgs.minimized}}
      <nav class="prontera-hubnav" aria-label="Hub">
        {{#each this.items as |item|}}
          <a
            href={{item.href}}
            class="prontera-hubnav__link {{if item.active '--active'}}"
            aria-current={{if item.active "page"}}
          >{{item.label}}</a>
        {{/each}}
      </nav>
    {{/unless}}
  </template>
}
