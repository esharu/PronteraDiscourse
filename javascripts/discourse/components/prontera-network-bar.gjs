import Component from "@glimmer/component";
import { service } from "@ember/service";
import { contextGame, gameInfo } from "../lib/prontera-game";

// Thin bar above the header (outlet `above-site-header`): the network name,
// a switch between the two games (each lands on that game's forum section)
// and a link out to the matching hub. Live data (WoE countdown, patch) joins
// once the hub's portal feed carries it.
export default class PronteraNetworkBar extends Component {
  @service router;

  get current() {
    return contextGame(this.router);
  }

  get games() {
    return ["ro3", "roz"].map((key) => {
      const info = gameInfo(key);
      return { ...info, active: key === this.current };
    });
  }

  get hub() {
    return gameInfo(this.current);
  }

  <template>
    <div class="prontera-netbar">
      <div class="prontera-netbar__inner">
        <span class="prontera-netbar__name">PRONTERA.INFO</span>
        <nav class="prontera-netbar__games" aria-label="Games">
          {{#each this.games as |g|}}
            <a
              href={{g.forumPath}}
              class="prontera-netbar__game {{if g.active '--active'}}"
              data-game={{g.key}}
              aria-current={{if g.active "true"}}
            >
              <span class="prontera-seal" data-game={{g.key}}>{{g.seal}}</span>
              {{g.label}}
            </a>
          {{/each}}
        </nav>
        <span class="prontera-netbar__spacer"></span>
        <a class="prontera-netbar__hub" href={{this.hub.hubUrl}}>
          {{this.hub.label}}
          database &amp; tools →
        </a>
      </div>
    </div>
  </template>
}
