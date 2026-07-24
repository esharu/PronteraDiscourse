import { apiInitializer } from "discourse/lib/api";

// Prontera header enhancements:
//  1. Network switcher — the brand logo doubles as a hub switcher (emblem +
//     wordmark + dropdown), mirroring the Nuxt hub headers.
//  2. Hero logo — on the homepage top the brand is enlarged; it shrinks back
//     to normal as soon as the visitor scrolls (desktop only).
//  3. Wire the footer "Cookie settings" button to re-open Klaro.
//
// `settings` is the theme-settings global injected by Discourse.
/* global settings */

// Prontera emblem (crest + cathedral + poring + banner), no instance seal —
// the forum is network-level. Colors come from the theme's --p-* tokens.
const EMBLEM = `
<svg viewBox="0 0 120 122" class="prontera-switcher__emblem" aria-hidden="true">
  <path d="M60,6 C86,6 105,21 105,47 C105,85 79,111 60,133 C41,111 15,85 15,47 C15,21 34,6 60,6 Z"
        fill="var(--p-midnight)" stroke="#31465c" stroke-width="2"/>
  <rect x="27" y="68" width="16" height="40" fill="var(--p-parchment)"/>
  <path d="M24,68 L35,49 L46,68 Z" fill="var(--p-verdigris)"/>
  <rect x="77" y="68" width="16" height="40" fill="var(--p-parchment)"/>
  <path d="M74,68 L85,49 L96,68 Z" fill="var(--p-verdigris)"/>
  <rect x="49" y="52" width="22" height="56" fill="var(--p-parchment)"/>
  <path d="M45,52 L60,25 L75,52 Z" fill="var(--p-verdigris)"/>
  <path d="M54,108 L54,94 A6,6 0 0 1 66,94 L66,108 Z" fill="var(--p-midnight)"/>
  <rect x="24" y="106" width="72" height="2.6" fill="var(--p-gold)"/>
  <path d="M78,93.2 C79,91.4 80.8,91.4 81.2,92.9 C84.2,94.1 86.2,96.7 86.2,99.8 C86.2,103.5 82.7,105.9 78,105.9 C73.3,105.9 69.8,103.5 69.8,99.8 C69.8,96.7 71.8,94.1 74.8,92.9 C75.2,91.4 77,91.4 78,93.2 Z"
        fill="var(--p-poring)"/>
  <circle cx="75.4" cy="99.6" r="1.35" fill="var(--p-midnight)"/>
  <circle cx="80.6" cy="99.6" r="1.35" fill="var(--p-midnight)"/>
  <rect x="58.7" y="10" width="2.6" height="17" rx="1.3" fill="var(--p-gold)"/>
  <path d="M61,11 L80,16 L61,21 Z" fill="var(--p-banner-red)"/>
</svg>`;

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

// One dropdown row (seal or icon + label + sub-text, optional "here" badge).
function row({ href, seal, sealAccent, icon, label, sub, active, here }) {
  const a = el("a", "prontera-switcher__row" + (active ? " prontera-switcher__row--active" : ""));
  a.setAttribute("role", "menuitem");
  a.href = href;

  if (seal) {
    const s = el("span", "prontera-switcher__seal", seal);
    s.setAttribute("data-accent", sealAccent);
    a.appendChild(s);
  } else {
    a.appendChild(el("span", "prontera-switcher__ic", icon || "🏛"));
  }

  const txt = el("span", "prontera-switcher__rowtext");
  txt.appendChild(el("b", null, label));
  txt.appendChild(el("span", "prontera-switcher__rowsub", sub));
  a.appendChild(txt);

  if (here) {
    a.appendChild(el("span", "prontera-switcher__here", here));
  }
  return a;
}

function buildSwitcher() {
  const wrap = el("div", "prontera-switcher");

  // Trigger: emblem + wordmark + chevron.
  const trigger = el("button", "prontera-switcher__trigger");
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", "Switch hub");
  trigger.innerHTML = EMBLEM;

  const wm = el("span", "prontera-switcher__wordmark");
  const name = el("span", "prontera-switcher__name");
  name.appendChild(document.createTextNode("PRONTERA"));
  name.appendChild(el("span", "prontera-switcher__tld", ".info"));
  wm.appendChild(name);
  wm.appendChild(el("span", "prontera-switcher__sub", settings.brand_subline || "Community Board"));
  trigger.appendChild(wm);
  trigger.appendChild(el("span", "prontera-switcher__chev", "▾"));
  wrap.appendChild(trigger);

  // Panel.
  const panel = el("div", "prontera-switcher__panel");
  panel.setAttribute("role", "menu");
  panel.appendChild(el("p", "prontera-switcher__heading", settings.network_heading || "Prontera Network"));

  panel.appendChild(
    row({
      href: settings.ro3_url,
      seal: "3",
      sealAccent: "banner-red",
      label: settings.ro3_label,
      sub: settings.ro3_domain,
    })
  );
  panel.appendChild(
    row({
      href: settings.roz_url,
      seal: "Z",
      sealAccent: "gold",
      label: settings.roz_label,
      sub: settings.roz_domain,
    })
  );

  panel.appendChild(el("div", "prontera-switcher__divider"));

  panel.appendChild(
    row({
      href: "/",
      icon: "🏛",
      label: settings.board_label || "Board & Portal",
      sub: settings.board_desc || "",
      active: true,
      here: "You're here",
    })
  );

  wrap.appendChild(panel);

  // Open/close is handled by delegated document listeners (see initializer),
  // so the switcher keeps working across Discourse's header re-renders.
  return wrap;
}

// Close every open switcher.
function closeSwitchers() {
  document
    .querySelectorAll(".prontera-switcher.is-open")
    .forEach((sw) => {
      sw.classList.remove("is-open");
      const t = sw.querySelector(".prontera-switcher__trigger");
      if (t) {
        t.setAttribute("aria-expanded", "false");
      }
    });
}

// One set of delegated listeners for all (re-)mounted switchers.
function installSwitcherEvents() {
  if (window.__pronteraSwitcherEvents) {
    return;
  }
  window.__pronteraSwitcherEvents = true;

  document.addEventListener("click", (e) => {
    const trigger =
      e.target.closest && e.target.closest(".prontera-switcher__trigger");
    if (trigger) {
      e.preventDefault();
      const sw = trigger.closest(".prontera-switcher");
      const willOpen = !sw.classList.contains("is-open");
      closeSwitchers();
      sw.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
      return;
    }
    // Click on a menu row or anywhere outside → close.
    closeSwitchers();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSwitchers();
    }
  });
}

function mountSwitcher() {
  if (!settings.network_switcher_enabled) {
    return;
  }
  const header = document.querySelector(".d-header .contents") || document.querySelector(".d-header");
  if (!header || header.querySelector(".prontera-switcher")) {
    return;
  }
  const logo = header.querySelector(".home-logo, .title");
  const switcher = buildSwitcher();
  if (logo) {
    logo.parentNode.insertBefore(switcher, logo);
  } else {
    header.insertBefore(switcher, header.firstChild);
  }
  document.documentElement.classList.add("prontera-switcher-on");
}

export default apiInitializer("1.14.0", (api) => {
  const root = document.documentElement;

  if (settings.hero_logo_enabled) {
    root.style.setProperty("--prontera-hero-logo-height", (settings.hero_logo_max_height || 68) + "px");
  }

  const router = api.container.lookup("service:router");
  const wide = window.matchMedia("(min-width: 768px)");

  const isHome = () => {
    const url = router.currentURL || "/";
    return url === "/" || url.startsWith("/?");
  };
  const updateHero = () => {
    const atTop = (window.scrollY || window.pageYOffset || 0) < 60;
    const on = settings.hero_logo_enabled && wide.matches && isHome() && atTop;
    root.classList.toggle("prontera-top", on);
  };

  window.addEventListener("scroll", updateHero, { passive: true });

  installSwitcherEvents();

  api.onPageChange(() => {
    mountSwitcher();
    closeSwitchers();
    updateHero();
  });

  // Initial mount (header may already be present at boot).
  mountSwitcher();
  updateHero();

  // Footer "Cookie settings" button → re-open Klaro.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest(".prontera-footer__cookie-settings");
    if (btn && window.klaro && typeof window.klaro.show === "function") {
      e.preventDefault();
      window.klaro.show();
    }
  });
});
