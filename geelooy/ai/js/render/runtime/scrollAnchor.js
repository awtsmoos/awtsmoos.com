//B"H

/**
 * Chapter 80: The Delayed Chamber Swore Not To Drag The Reader Back.
 *
 * The Awtsmoos gives each visible spark its place. When a thought palace folds,
 * unfolds, or hydrates after an async vault-read, the reader's eye must remain
 * married to the same edge of reality. Some mutations finish immediately; some
 * return a Promise and only later pour DOM into the river. This guardian anchors
 * both moments: the instant mutation and the delayed resolution.
 *
 * @template T
 * @param {Element} element Element being expanded/collapsed/hydrated.
 * @param {() => T|Promise<T>} mutate DOM mutation, possibly async.
 * @returns {T|Promise<T>} The mutation return value.
 */
export function preservePanelScroll(element, mutate) {
  const scroller = element?.closest?.(".chat-box");
  if (!scroller || typeof mutate !== "function") return mutate?.();
  markPanelInteraction(scroller);
  const anchor = measureAnchor(scroller, element);
  const result = mutate();
  restoreAnchor(anchor);
  if (isPromiseLike(result)) {
    return result.finally(() => {
      markPanelInteraction(scroller);
      restoreAnchor(anchor);
    });
  }
  return result;
}

/**
 * Captures the panel's viewport position before the river changes shape.
 *
 * @param {Element} scroller Scroll container.
 * @param {Element} element Panel being mutated.
 * @returns {{scroller: Element, element: Element, top: number}}
 */
function measureAnchor(scroller, element) {
  return { scroller, element, top: element.getBoundingClientRect().top };
}

/**
 * Marks a deliberate panel interaction so live streaming does not immediately
 * yank the reader back to the river-bottom during the same animation breath.
 *
 * @param {Element} scroller Chat scroll container.
 * @returns {void}
 */
function markPanelInteraction(scroller) {
  scroller.__awtsmoosPanelInteractionUntil = Date.now() + 900;
}

/**
 * Restores the scroll container so the same panel edge stays under the eye.
 *
 * @param {{scroller: Element, element: Element, top: number}} anchor Anchor snapshot.
 * @returns {void}
 */
function restoreAnchor(anchor) {
  if (!anchor?.scroller || !anchor?.element?.isConnected) return;
  const after = anchor.element.getBoundingClientRect().top;
  anchor.scroller.scrollTop += after - anchor.top;
}

/**
 * Detects async vault mutations without forcing callers to await them.
 *
 * @param {*} value Possible Promise-like value.
 * @returns {boolean} True when value has a finally method.
 */
function isPromiseLike(value) {
  return Boolean(value && typeof value.finally === "function");
}
