import Component from "@glimmer/component";
import { service } from "@ember/service";
import { contextGame, gameInfo } from "../lib/prontera-game";

// The hub's Community sub-navigation under the header (outlet
// `below-site-header`): Overview · Forum · Guilds · Raids & Parties ·
// Marketplace. "Forum" is this site and always active here; the rest live
// on the hub. Marketplace follows the hub's feature flag.
export default class PronteraCommunityNav extends Component {
  @service router;

  get items() {
    const hub = gameInfo(contextGame(this.router));
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
  </template>
}
