//B"H

/**
 * Chapter 1: The Open Vessel Refused The Knife.
 *
 * The Awtsmoos renews the stream, yet an opened diagnostic chamber is a human
 * reading-place. When fresh HTML arrives for an expanded vessel, this guardian
 * stores it as pending instead of tearing the DOM apart with innerHTML.
 *
 * @param {Element} vessel Inner event vessel.
 * @param {string} html Fresh rendered HTML.
 * @returns {boolean} True when mutation should be skipped now.
 */
export function holdOpenVessel(vessel, html) {
  if (!vessel || !hasOpenSurface(vessel)) return false;
  vessel.dataset.pendingInnerEventHtml = html;
  vessel.classList.add("has-pending-stream-update");
  return true;
}

/**
 * Applies a delayed update after the reader closes the opened surface.
 *
 * @param {Element} vessel Inner event vessel.
 * @returns {boolean} True when a pending update was applied.
 */
export function applyPendingWhenClosed(vessel) {
  const html = vessel?.dataset?.pendingInnerEventHtml;
  if (!html || hasOpenSurface(vessel)) return false;
  vessel.innerHTML = html;
  vessel.dataset.innerEventHtml = html;
  delete vessel.dataset.pendingInnerEventHtml;
  vessel.classList.remove("has-pending-stream-update");
  return true;
}

/**
 * @param {Element} vessel Candidate vessel.
 * @returns {boolean} True when the user has an expanded readable surface.
 */
export function hasOpenSurface(vessel) {
  return Boolean(selectionTouches(vessel) || vessel?.querySelector?.("details[open], .is-maximized, .is-fullscreen"));
}

function selectionTouches(node) {
  try {
    const selection = globalThis.getSelection?.();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return false;
    for (let index = 0; index < selection.rangeCount; index++) {
      const range = selection.getRangeAt(index);
      if (range?.intersectsNode?.(node)) return true;
      if (node.contains?.(range.commonAncestorContainer)) return true;
    }
  } catch {}
  return false;
}
