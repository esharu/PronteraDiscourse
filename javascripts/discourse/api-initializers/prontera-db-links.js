import { apiInitializer } from "discourse/lib/api";
import {
  fetchEntityPreview,
  parseHubEntityUrl,
  safeImage,
  typeLabel,
} from "../lib/prontera-entity";

// Forum ↔ database, inside posts:
//
//  1. Oneboxes of hub entity pages become database cards — most visibly the
//     context post the hub writes when it opens a discussion topic.
//  2. Inline links to hub entities become typed chips with a hovercard.
//
// All DOM is built with textContent / setAttribute — preview data is never
// parsed as HTML. Nothing changes until a preview has actually arrived.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text != null) {
    node.textContent = text;
  }
  return node;
}

function imageBox(preview, className) {
  const box = el("span", className);
  const src = safeImage(preview.image);
  if (src) {
    const img = el("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    box.appendChild(img);
  }
  return box;
}

// ---------------------------------------------------------------- DB cards

function buildCard(entity, preview) {
  const card = el("div", "prontera-dbcard");
  card.dataset.type = entity.type;
  card.dataset.game = entity.game;

  const body = el("div", "prontera-dbcard__body");
  body.appendChild(imageBox(preview, "prontera-dbcard__art"));

  const text = el("div", "prontera-dbcard__text");
  text.appendChild(
    el(
      "span",
      "prontera-dbcard__kicker",
      [typeLabel(entity.type), ...preview.lines.slice(0, 1)].join(" · ")
    )
  );
  text.appendChild(el("span", "prontera-dbcard__name", preview.name));
  if (preview.lines.length > 1) {
    text.appendChild(
      el("span", "prontera-dbcard__lines", preview.lines.slice(1).join(" · "))
    );
  }
  body.appendChild(text);
  card.appendChild(body);

  const actions = el("div", "prontera-dbcard__actions");
  const open = el("a", "prontera-dbcard__btn --primary", "Open in database");
  open.href = preview.url;
  actions.appendChild(open);
  actions.appendChild(
    el(
      "span",
      "prontera-dbcard__note",
      "Comments here also appear on the database page."
    )
  );
  card.appendChild(actions);
  return card;
}

function decorateOneboxes(element) {
  element.querySelectorAll("aside.onebox[data-onebox-src]").forEach((box) => {
    if (box.dataset.prontera) {
      return;
    }
    const entity = parseHubEntityUrl(box.dataset.oneboxSrc);
    if (!entity) {
      return;
    }
    box.dataset.prontera = "pending";
    fetchEntityPreview(entity).then((preview) => {
      if (!preview || !box.isConnected) {
        box.dataset.prontera = "skipped";
        return;
      }
      box.replaceWith(buildCard(entity, preview));
    });
  });
}

// ------------------------------------------------------------------ chips

function decorateLinks(element) {
  element.querySelectorAll("a[href]").forEach((link) => {
    if (link.dataset.pronteraChip || link.closest("aside.onebox, .prontera-dbcard")) {
      return;
    }
    const entity = parseHubEntityUrl(link.getAttribute("href"));
    if (!entity) {
      return;
    }
    link.dataset.pronteraChip = "1";
    link.dataset.type = entity.type;
    link.dataset.game = entity.game;
    link.classList.add("prontera-chip");
    link.insertBefore(el("span", "prontera-chip__dot"), link.firstChild);
  });
}

// -------------------------------------------------------------- hovercard

let hovercard = null;
let hoverToken = 0;

function hideHovercard() {
  hoverToken++;
  if (hovercard) {
    hovercard.remove();
    hovercard = null;
  }
}

function showHovercard(link) {
  const entity = parseHubEntityUrl(link.getAttribute("href"));
  if (!entity) {
    return;
  }
  const token = ++hoverToken;
  fetchEntityPreview(entity).then((preview) => {
    if (!preview || token !== hoverToken || !link.isConnected) {
      return;
    }
    if (hovercard) {
      hovercard.remove();
    }
    const card = el("div", "prontera-hovercard");
    card.dataset.type = entity.type;
    card.setAttribute("role", "tooltip");

    const head = el("div", "prontera-hovercard__head");
    head.appendChild(imageBox(preview, "prontera-hovercard__art"));
    const text = el("div", "prontera-hovercard__text");
    text.appendChild(el("span", "prontera-hovercard__kicker", typeLabel(entity.type)));
    text.appendChild(el("span", "prontera-hovercard__name", preview.name));
    head.appendChild(text);
    card.appendChild(head);

    preview.lines.forEach((line) => {
      card.appendChild(el("span", "prontera-hovercard__line", line));
    });

    document.body.appendChild(card);
    const r = link.getBoundingClientRect();
    const width = card.offsetWidth;
    const left = Math.min(
      Math.max(8, r.left),
      window.innerWidth - width - 8
    );
    card.style.left = `${Math.round(left + window.scrollX)}px`;
    card.style.top = `${Math.round(r.bottom + 8 + window.scrollY)}px`;
    hovercard = card;
  });
}

function installHoverEvents() {
  if (window.__pronteraHovercardEvents) {
    return;
  }
  window.__pronteraHovercardEvents = true;

  const chipFrom = (e) => e.target.closest && e.target.closest("a.prontera-chip");

  document.addEventListener("mouseover", (e) => {
    const chip = chipFrom(e);
    if (chip && !chip.contains(e.relatedTarget)) {
      showHovercard(chip);
    }
  });
  document.addEventListener("mouseout", (e) => {
    const chip = chipFrom(e);
    if (chip && !chip.contains(e.relatedTarget)) {
      hideHovercard();
    }
  });
  document.addEventListener("focusin", (e) => {
    const chip = chipFrom(e);
    if (chip) {
      showHovercard(chip);
    }
  });
  document.addEventListener("focusout", (e) => {
    if (chipFrom(e)) {
      hideHovercard();
    }
  });
  window.addEventListener("scroll", hideHovercard, { passive: true });
}

export default apiInitializer("1.14.0", (api) => {
  installHoverEvents();

  api.decorateCookedElement(
    (element) => {
      decorateOneboxes(element);
      decorateLinks(element);
    },
    { id: "prontera-db-links" }
  );

  api.onPageChange(hideHovercard);
});
