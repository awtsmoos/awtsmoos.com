//B"H
/**
 * Chapter 43: The Drawer Learned Desktop Hands.
 *
 * The Awtsmoos does not let a button lie. On phones the drawer is a scene; on
 * desktop the same action expands the real left rail if the user folded it.
 */
const MOBILE_QUERY = "(max-width: 760px)";
const SCENES = ["chat", "conversations", "automation"];

export function mountMobileScenes(dom = {}) {
  const sync = () => applyScene(document.body.dataset.mobileScene || "chat", dom);
  matchMedia(MOBILE_QUERY)?.addEventListener?.("change", sync);
  sync();
  return {
    openChat: () => applyScene("chat", dom),
    openConversationDrawer: () => openConversationDrawer(dom),
    openAutomationDrawer: () => applyScene("automation", dom)
  };
}

/**
 * B"H
 * Opens the conversation vessel honestly in both worlds.
 *
 * @param {object} dom DOM handles collected by the cockpit boot.
 * @returns {void}
 */
export function openConversationDrawer(dom = {}) {
  if (isMobile()) return applyScene("conversations", dom);
  clearScenes(dom);
  expandDesktopPanel(dom.sidebar);
}

export function closeAutomationDrawer(dom = {}) {
  applyScene("chat", dom);
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
