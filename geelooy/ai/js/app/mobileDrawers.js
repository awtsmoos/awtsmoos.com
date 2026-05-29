//B"H
/**
 * Chapter 46: The Drawer Heard The Wide Phone Cry.
 *
 * The Awtsmoos does not measure a device by prideful pixels alone. A browser
 * can look wide and still be held in one trembling hand. This module therefore
 * joins the CSS covenant at 900px: below that crown, every panel becomes a
 * scene, and no rail is allowed to bite the chat vessel.
 */
const MOBILE_QUERY = "(max-width: 900px)";
const SCENES = ["chat", "conversations", "automation"];

/**
 * Mounts the mobile scene covenant onto the cockpit.
 *
 * @param {object} dom DOM handles collected by the app boot sequence.
 * @returns {{openChat: Function, openConversationDrawer: Function, openAutomationDrawer: Function}}
 * Small functions that switch the visible scene without leaking desktop state.
 */
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

/**
 * Closes automation by returning to the living chat scene.
 *
 * @param {object} dom DOM handles collected by the cockpit boot.
 * @returns {void}
 */
export function closeAutomationDrawer(dom = {}) {
  applyScene("chat", dom);
}

/**
 * Applies exactly one mobile scene.
 *
 * @param {string} scene Requested scene name.
 * @param {object} dom DOM handles for sidebar, automation panel, and main chat.
 * @returns {void}
 */
function applyScene(scene, dom) {
  if (!isMobile()) return clearScenes(dom);
  const next = SCENES.includes(scene) ? scene : "chat";
  document.body.dataset.mobileScene = next;
  dom.sidebar?.classList.toggle("mobile-scene-active", next === "conversations");
  dom.automationPanel?.classList.toggle("mobile-scene-active", next === "automation");
  dom.main?.classList.toggle("mobile-scene-active", next === "chat");
}

/**
 * Reopens a desktop panel if it has been collapsed into a rail.
 *
 * @param {HTMLElement | null | undefined} panel Panel element to reveal.
 * @returns {void}
 */
function expandDesktopPanel(panel) {
  if (!panel) return;
  const closed = panel.classList.contains("is-collapsed") || panel.classList.contains("is-detached");
  if (!closed) return panel.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  panel.querySelector("[data-panel-action='toggle']")?.click();
}

/**
 * Clears mobile-only scene classes when the viewport becomes desktop again.
 *
 * @param {object} dom DOM handles collected by the cockpit boot.
 * @returns {void}
 */
function clearScenes(dom) {
  delete document.body.dataset.mobileScene;
  dom.sidebar?.classList.remove("mobile-scene-active");
  dom.automationPanel?.classList.remove("mobile-scene-active");
  dom.main?.classList.remove("mobile-scene-active");
}

/**
 * Checks whether the current viewport belongs to the one-scene covenant.
 *
 * @returns {boolean} True when mobile scene mode should be active.
 */
function isMobile() {
  return Boolean(matchMedia(MOBILE_QUERY)?.matches);
}
