//B"H
/**
 * @file showcaseChrome.js
 * @brief Optional premium chrome, mounted only when high FX is requested.
 *
 * Chapter 21: The Awtsmoos made the stars obedient. Showcase vessels no longer
 * appear in normal low-performance mode. They rise only for `awtsmoosFx=high`
 * or the explicit vision demo, preserving speed as the default covenant.
 */

const CHIPS = Object.freeze(["Local Relay", "Code Context", "Awtsmoos Tools"]);

/** B"H. Mounts visual showcase chrome only when allowed. */
export function mountShowcaseChrome() {
  if (!shouldMount()) return removeShowcaseChrome();
  mountHeroHalo();
  mountTunnelPulse();
  mountContextChips();
  mountComposerAura();
  mountPanelBadges();
}

function shouldMount() {
  const params = new URLSearchParams(location.search);
  return document.body.dataset.awtsmoosFx === "high" || params.get("awtsmoosVisionDemo") === "1";
}

function removeShowcaseChrome() {
  document.querySelectorAll(".showcase-hero-halo,.showcase-context-chips,.showcase-composer-aura,.showcase-side-badge,.showcase-tunnel-wave").forEach(node => node.remove());
}

function mountHeroHalo() {
  const main = document.querySelector(".main");
  if (!main || main.querySelector(".showcase-hero-halo")) return;
  const halo = document.createElement("div");
  halo.className = "showcase-hero-halo";
  halo.setAttribute("aria-hidden", "true");
  halo.innerHTML = `<span>✺</span><i></i><b></b>`;
  main.prepend(halo);
}

function mountTunnelPulse() {
  const transport = document.getElementById("transport-status");
  if (!transport || transport.querySelector(".showcase-tunnel-wave")) return;
  const wave = document.createElement("span");
  wave.className = "showcase-tunnel-wave";
  wave.setAttribute("aria-hidden", "true");
  wave.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
  transport.prepend(wave);
}

function mountContextChips() {
  const chat = document.getElementById("chat-box");
  if (!chat || chat.querySelector(".showcase-context-chips")) return;
  const rail = document.createElement("div");
  rail.className = "showcase-context-chips";
  rail.setAttribute("aria-label", "Awtsmoos context chips");
  rail.innerHTML = CHIPS.map(text => `<span>${escapeHtml(text)}</span>`).join("");
  chat.prepend(rail);
}

function mountComposerAura() {
  const composer = document.querySelector(".input-area");
  if (!composer || composer.querySelector(".showcase-composer-aura")) return;
  const aura = document.createElement("span");
  aura.className = "showcase-composer-aura";
  aura.setAttribute("aria-hidden", "true");
  composer.prepend(aura);
}

function mountPanelBadges() {
  const sidebar = document.querySelector(".conversation-list");
  const automation = document.getElementById("automation-panel");
  if (sidebar && !sidebar.querySelector(".showcase-side-badge")) sidebar.prepend(badge("AI Memory", "cyan"));
  if (automation && !automation.querySelector(".showcase-side-badge")) automation.prepend(badge("Tool Matrix", "purple"));
}

function badge(text, tone) {
  const node = document.createElement("div");
  node.className = `showcase-side-badge is-${tone}`;
  node.textContent = text;
  return node;
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
}
