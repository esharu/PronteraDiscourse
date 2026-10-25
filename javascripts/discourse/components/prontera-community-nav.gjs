import Component from "@glimmer/component";
import { service } from "@ember/service";
import { gameInfo, pageGame } from "../lib/prontera-game";

// The hub's Community sub-navigation at the top of the content column
// (outlet `above-main-container`): Overview · Forum · Guilds · Raids &
// Parties · Marketplace. "Forum" is this site and always active; the rest
// live on the hub. Marketplace follows the hub's feature flag.
//
// Only on pages that belong to a game — the homepage and network-wide
// categories have no single hub to point at. In the content column rather
// than under the header so it never adds height to the sticky header stack
// the sidebar is positioned against.
export default class PronteraCommunityNav extends Component {
  @service router;

  get game() {
    return pageGame(this.router);
  }

  get items() {
    const hub = gameInfo(this.game);
    const items = [
      { label: "Overview", href: `${hub.hubUrl}/community` },
      { label: "Forum", href: hub.forumPath, active: true },
      { label: "Guilds", href: `${hub.hubUrl}/guilds` },
      { label: "Raids & Parties", href: `${hub.hubUrl}/raids` },
    ];
    if (hub.marketplace) {
      items.push({ label: "Marketplace", href: `${hub.hubUrl}/marketplace` });
    }
    return items;
  }

  <template>
    {{#if this.game}}
    <div class="prontera-subnav">
      <nav class="prontera-subnav__inner" aria-label="Community">
        {{#each this.items as |item|}}
          <a
            href={{item.href}}
            class="prontera-subnav__link {{if item.active '--active'}}"
            aria-current={{if item.active "page"}}
          >{{item.label}}</a>
        {{/each}}
      </nav>
    </div>
    {{/if}}
  </template>
}
