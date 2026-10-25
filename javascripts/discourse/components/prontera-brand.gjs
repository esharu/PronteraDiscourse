import Component from "@glimmer/component";
import { service } from "@ember/service";
import { contextGame, gameInfo, pageGame } from "../lib/prontera-game";

// `settings` is the theme-settings global injected by Discourse.
/* global settings */

// Replaces the stock header logo (wrapper outlet `home-logo`): Prontera
// emblem + wordmark, with the subline naming the game this page belongs to —
// the same lockup the hub header shows ("PRONTERA.info / RAGNAROK ZERO").
export default class PronteraBrand extends Component {
  @service router;

  get subline() {
    const game = pageGame(this.router);
    return game ? gameInfo(game).label : settings.board_subline;
  }

  get game() {
    return contextGame(this.router);
  }

  <template>
    <div class="title">
      <a href="/" class="prontera-brand" data-game={{this.game}}>
        <svg
          class="prontera-brand__emblem"
          viewBox="0 0 120 136"
          aria-hidden="true"
        >
          <path
            d="M60,6 C86,6 105,21 105,47 C105,85 79,111 60,133 C41,111 15,85 15,47 C15,21 34,6 60,6 Z"
            fill="var(--p-midnight)"
            stroke="#31465c"
            stroke-width="2"
          />
          <rect x="27" y="68" width="16" height="40" fill="var(--p-parchment)" />
          <path d="M24,68 L35,49 L46,68 Z" fill="var(--p-verdigris)" />
          <rect x="77" y="68" width="16" height="40" fill="var(--p-parchment)" />
          <path d="M74,68 L85,49 L96,68 Z" fill="var(--p-verdigris)" />
          <rect x="49" y="52" width="22" height="56" fill="var(--p-parchment)" />
          <path d="M45,52 L60,25 L75,52 Z" fill="var(--p-verdigris)" />
          <path
            d="M54,108 L54,94 A6,6 0 0 1 66,94 L66,108 Z"
            fill="var(--p-midnight)"
          />
          <rect x="24" y="106" width="72" height="2.6" fill="var(--p-gold)" />
          <path
            d="M78,93.2 C79,91.4 80.8,91.4 81.2,92.9 C84.2,94.1 86.2,96.7 86.2,99.8 C86.2,103.5 82.7,105.9 78,105.9 C73.3,105.9 69.8,103.5 69.8,99.8 C69.8,96.7 71.8,94.1 74.8,92.9 C75.2,91.4 77,91.4 78,93.2 Z"
            fill="var(--p-poring)"
          />
          <circle cx="75.4" cy="99.6" r="1.35" fill="var(--p-midnight)" />
          <circle cx="80.6" cy="99.6" r="1.35" fill="var(--p-midnight)" />
          <rect
            x="58.7"
            y="10"
            width="2.6"
            height="17"
            rx="1.3"
            fill="var(--p-gold)"
          />
          <path d="M61,11 L80,16 L61,21 Z" fill="var(--p-banner-red)" />
        </svg>
        <span class="prontera-brand__wordmark">
          <span class="prontera-brand__name">PRONTERA<span
              class="prontera-brand__tld"
            >.info</span></span>
          <span class="prontera-brand__sub">{{this.subline}}</span>
        </span>
      </a>
    </div>
  </template>
}
