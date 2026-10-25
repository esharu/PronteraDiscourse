import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import DModal from "discourse/components/d-modal";
import { i18n } from "discourse-i18n";
import { gameInfo } from "../lib/prontera-game";
import { safeImage, typeLabel } from "../lib/prontera-entity";

/* global themePrefix */

const MIN_QUERY = 2;
const DEBOUNCE_MS = 250;

// "Insert from the database": searches the hub of the current game through
// its public GET /api/portal/search (esharu/printera) and inserts the pick
// as a markdown link to the hub page — which the post then renders as a
// typed chip with a hovercard (api-initializers/prontera-db-links.js).
//
// @model.game   "roz" | "ro3" — the hub to search first
// @model.insert (text) => void — writes into the composer
export default class PronteraInsertDbModal extends Component {
  @tracked game = this.args.model.game;
  @tracked query = "";
  @tracked hits = [];
  @tracked state = "idle"; // idle | loading | done | error

  timer = null;
  requestId = 0;

  t(key) {
    return i18n(themePrefix(`insert_db.${key}`));
  }

  get title() {
    return this.t("title");
  }
  get placeholder() {
    return this.t("placeholder");
  }
  get hint() {
    return this.t("hint");
  }
  get emptyText() {
    return this.t("empty");
  }
  get errorText() {
    return this.t("unavailable");
  }

  get games() {
    return ["roz", "ro3"].map((key) => ({
      key,
      label: gameInfo(key).label,
      active: key === this.game,
    }));
  }

  get rows() {
    return this.hits.map((hit) => ({
      ...hit,
      image: safeImage(hit.image),
      kind: typeLabel(hit.type),
    }));
  }

  get isEmpty() {
    return this.state === "done" && this.hits.length === 0;
  }

  get isError() {
    return this.state === "error";
  }

  willDestroy() {
    super.willDestroy(...arguments);
    clearTimeout(this.timer);
  }

  async search() {
    const q = this.query.trim();
    const id = ++this.requestId;
    if (q.length < MIN_QUERY) {
      this.hits = [];
      this.state = "idle";
      return;
    }
    this.state = "loading";
    try {
      const params = new URLSearchParams({ q });
      const response = await fetch(
        `${gameInfo(this.game).hubUrl}/api/portal/search?${params}`,
        { credentials: "omit" }
      );
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      const data = await response.json();
      if (id !== this.requestId) {
        return;
      }
      this.hits = Array.isArray(data.hits) ? data.hits : [];
      this.state = "done";
    } catch {
      if (id === this.requestId) {
        this.hits = [];
        this.state = "error";
      }
    }
  }

  @action
  onInput(event) {
    this.query = event.target.value;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.search(), DEBOUNCE_MS);
  }

  @action
  onKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (this.hits.length) {
        this.pick(this.hits[0]);
      }
    }
  }

  @action
  selectGame(key) {
    if (key !== this.game) {
      this.game = key;
      this.search();
    }
  }

  @action
  pick(hit) {
    // Markdown link text must not break out of its brackets.
    const name = String(hit.name).replace(/[[\]]/g, "");
    this.args.model.insert(`[${name}](${hit.url})`);
    this.args.closeModal();
  }

  <template>
    <DModal
      @title={{this.title}}
      @closeModal={{@closeModal}}
      class="prontera-insert-db"
    >
      <:body>
        <div class="prontera-insert-db__games" role="group">
          {{#each this.games as |g|}}
            <button
              type="button"
              class="btn btn-small {{if g.active 'btn-primary' 'btn-default'}}"
              aria-pressed={{if g.active "true" "false"}}
              {{on "click" (fn this.selectGame g.key)}}
            >{{g.label}}</button>
          {{/each}}
        </div>

        <input
          type="search"
          class="prontera-insert-db__input"
          placeholder={{this.placeholder}}
          aria-label={{this.placeholder}}
          autocomplete="off"
          value={{this.query}}
          {{on "input" this.onInput}}
          {{on "keydown" this.onKeydown}}
        />
        <p class="prontera-insert-db__hint">{{this.hint}}</p>

        {{#if this.isError}}
          <p class="prontera-insert-db__status">{{this.errorText}}</p>
        {{else if this.isEmpty}}
          <p class="prontera-insert-db__status">{{this.emptyText}}</p>
        {{/if}}

        <ul class="prontera-insert-db__results">
          {{#each this.rows as |hit|}}
            <li>
              <button
                type="button"
                class="prontera-insert-db__hit"
                data-type={{hit.type}}
                {{on "click" (fn this.pick hit)}}
              >
                <span class="prontera-insert-db__art">
                  {{#if hit.image}}
                    <img src={{hit.image}} alt="" loading="lazy" />
                  {{/if}}
                </span>
                <span class="prontera-insert-db__text">
                  <span class="prontera-insert-db__name">{{hit.name}}</span>
                  {{#if hit.subtitle}}
                    <span class="prontera-insert-db__sub">{{hit.subtitle}}</span>
                  {{/if}}
                </span>
                <span class="prontera-insert-db__kind">{{hit.kind}}</span>
              </button>
            </li>
          {{/each}}
        </ul>
      </:body>
    </DModal>
  </template>
}
