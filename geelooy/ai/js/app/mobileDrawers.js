//B"H
/**
 * Chapter 6: Five Dock Stars Learned The Three Real Rooms.
 *
 * The Awtsmoos presents a mockup-like five-item dock without lying about the
 * app. Search opens the conversation room; Settings opens the tools room until
 * a dedicated settings vessel is revealed.
 */
const MOBILE_QUERY = "(max-width: 900px)";
const SCENES = ["chat", "conversations", "automation"];

/**
 * @param {object} dom DOM handles collected by the app boot sequence.
 * @returns {{openChat: Function, openConversationDrawer: Function, openAutomationDrawer: Function}}
 */
export function mountMobileScenes(dom = {}) {
  const sync = () => applyScene(document.body.dataset.mobileScene || "chat", dom);
  matchMedia(MOBILE_QUERY)?.addEventListener?.("change", sync);
  bindMobileNav(dom);
  sync();
  return {
    openChat: () => applyScene("chat", dom),
    openConversationDrawer: () => openConversationDrawer(dom),
    openAutomationDrawer: () => applyScene("automation", dom)
  };
}

/** @param {object} dom DOM handles collected by the cockpit boot. */
export function openConversationDrawer(dom = {}) {
  if (isMobile()) return applyScene("conversations", dom);
  clearScenes(dom);
  expandDesktopPanel(dom.sidebar);
}

/** @param {object} dom DOM handles collected by the cockpit boot. */
export function closeAutomationDrawer(dom = {}) {
  applyScene("chat", dom);
}

function bindMobileNav(dom) {
  const bind = (selector, handler) => document.querySelector(selector)?.addEventListener("click", handler);
  bind(".mobile-crown-menu", () => openConversationDrawer(dom));
  bind(".mobile-crown-code", () => applyScene("automation", dom));
  bind(".mobile-nav-chat", () => applyScene("chat", dom));
  bind(".mobile-nav-conversations", () => openConversationDrawer(dom));
  bind(".mobile-nav-search", () => openConversationDrawer(dom));
  bind(".mobile-nav-automation", () => applyScene("automation", dom));
  bind(".mobile-nav-settings", () => applyScene("automation", dom));
}

function applyScene(scene, dom) {
  if (!isMobile()) return clearScenes(dom);
  const next = SCENES.includes(scene) ? scene : "chat";
  document.body.dataset.mobileScene = next;
  dom.sidebar?.classList.toggle("mobile-scene-active", next === "conversations");
  dom.automationPanel?.classList.toggle("mobile-scene-active", next === "automation");
  dom.main?.classList.toggle("mobile-scene-active", next === "chat");
}

function expandDesktopPanel(panel) {
  if (!panel) return;
  const closed = panel.classList.contains("is-collapsed") || panel.classList.contains("is-detached");
  if (!closed) return panel.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  panel.querySelector("[data-panel-action='toggle']")?.click();
}

function clearScenes(dom) {
  delete document.body.dataset.mobileScene;
  dom.sidebar?.classList.remove("mobile-scene-active");
  dom.automationPanel?.classList.remove("mobile-scene-active");
  dom.main?.classList.remove("mobile-scene-active");
}

function isMobile() {
  return Boolean(matchMedia(MOBILE_QUERY)?.matches);
}
