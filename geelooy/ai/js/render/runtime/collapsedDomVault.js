//B"H

const DISCARD_SELECTOR = "details.transport-details[data-event-payload-key], details.thought-envelope-events";
const DISCARD_BODY_SELECTORS = [":scope > .event-lanes", ":scope > .thought-inner-window", ":scope > .event-hydration-loading"];

/**
 * Chapter 8: The Closed Gate Held No Crowd.
 *
 * Closed heavy panels must not merely hide their citizens, nor keep detached
 * citizens breathing in RAM. This vault discards rehydratable bodies. Opening a
 * gate lets the event-body hydrator rebuild only that requested section from
 * the payload vault. Lightweight nested value panels are left alone unless they
 * gain their own payload key, because destroying unrecoverable markup would be
 * false mercy.
 *
 * @param {ParentNode} root Region whose closed heavy panels should be light.
 * @returns {void}
 * @sideEffects Installs one delegated toggle listener and removes closed bodies.
 */
export function installCollapsedDomVault(root) {
  if (!root || root.__awtsmoosCollapsedDomVault) return;
  root.__awtsmoosCollapsedDomVault = true;
  root.addEventListener("toggle", event => {
    const panel = event.target;
    if (!isDiscardable(panel)) return;
    if (!panel.open) discardBody(panel);
  }, true);
}

/**
 * Sweeps a freshly rendered region and removes every closed heavy body.
 *
 * @param {ParentNode} root Freshly rendered node or region.
 * @returns {void}
 */
export function vaultCollapsedPanels(root) {
  if (!root?.querySelectorAll) return;
  [...root.querySelectorAll(DISCARD_SELECTOR)].forEach(panel => {
    if (!panel.open) discardBody(panel);
  });
}

function isDiscardable(node) {
  return node?.matches?.(DISCARD_SELECTOR);
}

function discardBody(panel) {
  for (const selector of DISCARD_BODY_SELECTORS) panel.querySelector(selector)?.remove();
  panel.dataset.domVaulted = "discarded";
}
