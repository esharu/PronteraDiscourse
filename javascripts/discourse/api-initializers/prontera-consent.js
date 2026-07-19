import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";

// Cookie consent via Klaro! (self-hosted theme asset) with consent-gated GA4.
//
// Loaded here — not in head_tag — because head_tag is not a reliable place to
// load vendor JS in Discourse's SPA, and `settings.theme_uploads` is only
// dependable in the JS API context. `loadScript` appends the script, caches,
// and resolves once it is ready.
//
// `settings` is the theme-settings global injected by Discourse.
/* global settings */

export default apiInitializer("1.14.0", () => {
  if (!settings.consent_enabled) {
    return;
  }

  const klaroUrl = settings.theme_uploads && settings.theme_uploads.klaro;
  if (!klaroUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      "[prontera] Klaro asset not found at settings.theme_uploads.klaro — " +
        "re-import/update the theme so assets/klaro.js is uploaded."
    );
    return;
  }

  const gaId = (settings.ga4_measurement_id || "").trim();

  // gtag.js loader — invoked by Klaro only once the analytics service is granted.
  window.pronteraLoadGA = function () {
    if (!gaId || window.__pronteraGALoaded) {
      return;
    }
    window.__pronteraGALoaded = true;
    window["ga-disable-" + gaId] = false;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });
  };

  window.klaroConfig = {
    version: 1,
    elementID: "klaro",
    storageMethod: "cookie",
    cookieName: "prontera_consent",
    cookieExpiresAfterDays: 365,
    htmlTexts: true,
    default: false,
    mustConsent: false,
    acceptAll: true,
    hideDeclineAll: false,
    privacyPolicy: settings.privacy_policy_url || "/privacy",
    translations: {
      zz: { privacyPolicyUrl: settings.privacy_policy_url || "/privacy" },
      en: {
        consentModal: {
          title: "Privacy settings",
          description:
            "We use cookies only to understand how the community is used. Nothing loads until you agree. Prontera.info is a non-commercial fan project.",
        },
        consentNotice: {
          description:
            "We'd like to use analytics cookies to improve the site. {purposes} — no analytics run without your consent.",
          learnMore: "Let me choose",
        },
        purposes: { functional: "Necessary", analytics: "Analytics", social: "Social / embeds" },
        essential: {
          title: "Essential (Discourse)",
          description: "Session, login and security cookies the forum needs to work. Always on.",
        },
        "discord-sso": {
          title: "Discord login",
          description: "Only used if you choose to sign in with Discord. Always on.",
        },
        "google-analytics": {
          title: "Google Analytics 4",
          description: "Anonymized usage statistics (page views, referrers).",
        },
        "discord-widget": {
          title: "Discord widget",
          description: "Loads Discord to show an embedded server widget (only where embedded).",
        },
        ok: "Accept",
        acceptAll: "Accept all",
        acceptSelected: "Accept selected",
        decline: "Decline",
        save: "Save",
        close: "Close",
      },
      de: {
        consentModal: {
          title: "Datenschutz-Einstellungen",
          description:
            "Wir nutzen Cookies nur, um zu verstehen, wie die Community genutzt wird. Es lädt nichts, bevor du zustimmst. Prontera.info ist ein nicht-kommerzielles Fan-Projekt.",
        },
        consentNotice: {
          description:
            "Wir würden gern Analyse-Cookies zur Verbesserung der Seite einsetzen. {purposes} — ohne deine Zustimmung läuft keine Analyse.",
          learnMore: "Auswählen",
        },
        purposes: { functional: "Notwendig", analytics: "Statistik", social: "Social / Einbettungen" },
        essential: {
          title: "Essenziell (Discourse)",
          description: "Sitzungs-, Login- und Sicherheits-Cookies, die das Forum zum Funktionieren braucht. Immer aktiv.",
        },
        "discord-sso": {
          title: "Discord-Login",
          description: "Wird nur genutzt, wenn du dich mit Discord anmeldest. Immer aktiv.",
        },
        "google-analytics": {
          title: "Google Analytics 4",
          description: "Anonymisierte Nutzungsstatistik (Seitenaufrufe, Verweise).",
        },
        "discord-widget": {
          title: "Discord-Widget",
          description: "Lädt Discord, um ein eingebettetes Server-Widget anzuzeigen (nur wo eingebunden).",
        },
        ok: "Akzeptieren",
        acceptAll: "Alle akzeptieren",
        acceptSelected: "Auswahl akzeptieren",
        decline: "Ablehnen",
        save: "Speichern",
        close: "Schließen",
      },
    },
    services: [
      // Strictly necessary — Discourse's own session/login/security cookies.
      // Consent-exempt under GDPR, listed for transparency and always on.
      {
        name: "essential",
        title: "Essential (Discourse)",
        purposes: ["functional"],
        cookies: [
          [/^_t$/i],
          [/^_forum_session$/i],
          [/^_bypass_cache$/i],
          [/^destination_url$/i],
          [/^cn$/i],
        ],
        required: true,
        default: true,
      },
      // Discord as a login provider — only active when the visitor chooses to
      // sign in with Discord, so it is functional/necessary, not opt-in.
      {
        name: "discord-sso",
        title: "Discord login",
        purposes: ["functional"],
        required: true,
        default: true,
      },
      // Optional analytics — the only opt-in service by default.
      {
        name: "google-analytics",
        title: "Google Analytics 4",
        purposes: ["analytics"],
        cookies: [[/^_ga.*$/i], [/^_gid$/i], [/^_gat.*$/i]],
        required: false,
        optOut: false,
        default: false,
        callback(consent) {
          if (consent) {
            window.pronteraLoadGA();
          } else if (gaId) {
            window["ga-disable-" + gaId] = true;
          }
        },
      },
      // Embedded Discord server widget — opt-in. Inert until an embed is
      // wired to it (mark the embed with data-name="discord-widget" so Klaro's
      // contextual blocking shows a placeholder until consent). See README.
      {
        name: "discord-widget",
        title: "Discord widget",
        purposes: ["social"],
        required: false,
        optOut: false,
        default: false,
      },
    ],
  };

  loadScript(klaroUrl).then(() => {
    if (window.klaro && typeof window.klaro.setup === "function") {
      window.klaro.setup(window.klaroConfig);
    }
  });
});
