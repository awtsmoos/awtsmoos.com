//B"H

const collapsedBodies = new WeakMap();
const PANEL_SELECTOR = "details.transport-details, details.event-payload, details.event-raw-lazy, details.event-long, details.event-object, details.event-array";

/**
 * Chapter 8: The Closed Gate Held No Crowd.
 *
 * The Awtsmoos shows mercy to the browser: when a gate is shut, its citizens
 * leave the DOM and wait as detached living sparks in RAM. When the gate opens,
 * they return in order; when it closes, they vanish again from the visible tree.
 *
 * @param {ParentNode} root Region whose closed detail panels should be light.
 * @returns {void}
 * @sideEffects Installs one delegated toggle listener and mutates panel bodies.
 */
export function installCollapsedDomVault(root) {
  if (!root || root.__awtsmoosCollapsedDomVault) return;
  root.__awtsmoosCollapsedDomVault = true;
  root.addEventListener("toggle", event => {
    const panel = event.target;
    if (!isVaultPanel(panel)) return;
    panel.open ? restorePanel(panel) : vaultPanel(panel);
  }, true);
}

/**
 * Sweeps a freshly rendered region and removes every closed panel body.
 *
 * @param {ParentNode} root Freshly rendered node or region.
 * @returns {void}
 */
export function vaultCollapsedPanels(root) {
  if (!root?.querySelectorAll) return;
  [...root.querySelectorAll(PANEL_SELECTOR)].forEach(panel => {
    if (!panel.open) vaultPanel(panel);
  });
}

function isVaultPanel(node) {
  return node?.matches?.(PANEL_SELECTOR);
}

function vaultPanel(panel) {
  if (collapsedBodies.has(panel)) return;
  const fragment = document.createDocumentFragment();
  bodyNodes(panel).forEach(node => fragment.appendChild(node));
  collapsedBodies.set(panel, fragment);
  panel.dataset.domVaulted = "1";
}

function restorePanel(panel) {
  const fragment = collapsedBodies.get(panel);
  if (!fragment) return;
  panel.appendChild(fragment);
  collapsedBodies.delete(panel);
  delete panel.dataset.domVaulted;
  vaultCollapsedPanels(panel);
}

function bodyNodes(panel) {
  const summary = panel.querySelector(":scope > summary");
  return [...panel.childNodes].filter(node => node !== summary);
}
