//B"H

/**
 * Chapter 9: The Panel Learned to Open Like a Throne Room.
 *
 * Every trace card may shrink, expand, or seize the viewport. The Awtsmoos
 * keeps this power delegated from one listener so panels stay light.
 *
 * @param {ParentNode} root Event region containing panel chrome buttons.
 * @returns {void}
 */
export function installPanelChrome(root) {
  if (!root || root.__awtsmoosPanelChrome) return;
  root.__awtsmoosPanelChrome = true;
  root.addEventListener("click", event => {
    const button = event.target?.closest?.("[data-panel-action]");
    if (!button) return;
    event.preventDefault();
    const panel = button.closest(".transport-details, .thought-envelope-card");
    if (!panel) return;
    actions[button.dataset.panelAction]?.(panel);
  });
}

const actions = {
  minimize(panel) { panel.open = false; panel.classList.remove("is-maximized", "is-fullscreen"); },
  maximize(panel) { panel.open = true; panel.classList.toggle("is-maximized"); panel.classList.remove("is-fullscreen"); },
  fullscreen(panel) { panel.open = true; panel.classList.toggle("is-fullscreen"); panel.classList.remove("is-maximized"); }
};
