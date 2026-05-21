//B"H
import { preservePanelScroll } from "./scrollAnchor.js";

/**
 * Chapter 76: The Chrome Buttons Became A Court Apart.
 *
 * The title may roar across two lines, but the buttons stand in their own rail.
 * When they collapse or magnify a panel, the reader's viewport is anchored to
 * the same spark, so the page no longer leaps back toward the previous user
 * message like a startled beast in the night.
 *
 * @param {ParentNode} root Event region containing panel chrome buttons.
 * @returns {void}
 */
export function installPanelChrome(root) {
  if (!root || root.__awtsmoosPanelChrome) return;
  root.__awtsmoosPanelChrome = true;
  root.addEventListener("click", event => handlePanelClick(event));
  root.addEventListener("toggle", event => {
    const panel = event.target?.closest?.(".transport-details, .thought-envelope-card");
    if (panel) syncPanelChrome(panel);
  }, true);
  installEscapeHandler();
  root.querySelectorAll(".transport-details, .thought-envelope-card").forEach(syncPanelChrome);
}

function handlePanelClick(event) {
  const button = event.target?.closest?.("[data-panel-action]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const panel = button.closest(".transport-details, .thought-envelope-card");
  if (!panel) return;
  preservePanelScroll(panel, () => actions[button.dataset.panelAction]?.(panel));
  syncPanelChrome(panel);
}

const actions = {
  minimize(panel) {
    panel.open = false;
    panel.classList.remove("is-maximized", "is-fullscreen");
    unlockFullscreenBody();
  },
  maximize(panel) {
    panel.open = true;
    panel.classList.toggle("is-maximized");
    panel.classList.remove("is-fullscreen");
    unlockFullscreenBody();
  },
  fullscreen(panel) {
    panel.open = true;
    panel.classList.toggle("is-fullscreen");
    panel.classList.remove("is-maximized");
    document.body.classList.toggle("has-event-fullscreen", panel.classList.contains("is-fullscreen"));
  }
};

function syncPanelChrome(panel) {
  if (!panel) return;
  const minimized = !panel.open;
  const maximized = panel.classList.contains("is-maximized");
  const fullscreen = panel.classList.contains("is-fullscreen");
  panel.dataset.panelState = fullscreen ? "fullscreen" : maximized ? "maximized" : minimized ? "minimized" : "normal";
  syncButton(panel, "minimize", minimized ? "Restore" : "Minimize", minimized ? "+" : "−", minimized);
  syncButton(panel, "maximize", maximized ? "Normal size" : "Maximize", maximized ? "▢" : "□", maximized);
  syncButton(panel, "fullscreen", fullscreen ? "Exit fullscreen" : "Fullscreen", fullscreen ? "↙" : "⛶", fullscreen);
}

function syncButton(panel, action, title, text, pressed) {
  const button = panel.querySelector(`[data-panel-action="${action}"]`);
  if (!button) return;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.setAttribute("aria-pressed", String(Boolean(pressed)));
  button.textContent = text;
}

let escapeInstalled = false;
function installEscapeHandler() {
  if (escapeInstalled) return;
  escapeInstalled = true;
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const fullscreen = document.querySelector(".transport-details.is-fullscreen, .thought-envelope-card.is-fullscreen");
    if (!fullscreen) return;
    preservePanelScroll(fullscreen, () => fullscreen.classList.remove("is-fullscreen"));
    syncPanelChrome(fullscreen);
    unlockFullscreenBody();
  });
}

function unlockFullscreenBody() {
  if (!document.querySelector(".transport-details.is-fullscreen, .thought-envelope-card.is-fullscreen")) document.body.classList.remove("has-event-fullscreen");
}
