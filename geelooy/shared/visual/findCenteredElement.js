// B"H
/**
 * @file findCenteredElement.js
 * @description
 * A small geometry vessel: the Awtsmoos shows which element stands closest to
 * the middle of the viewport without letting every caller rewrite the same
 * fragile math. No scrolling is owned here. No event is captured here. Only the
 * measured center is returned to the caller.
 */

function viewportMiddle(viewportHeight) {
  const height = Number.isFinite(viewportHeight)
    ? viewportHeight
    : (typeof innerHeight === 'number' ? innerHeight : 0);
  return height / 2;
}

/**
 * Find the element whose bounding box center is closest to viewport center.
 * @param {Element[]} elements
 * @param {number} [viewportHeight]
 * @returns {Element|null}
 */
export function findCenteredElement(elements = [], viewportHeight) {
  const center = viewportMiddle(viewportHeight);
  let best = null;
  let bestDistance = Infinity;

  elements.forEach(element => {
    if (!element?.getBoundingClientRect) return;
    const rect = element.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - center);
    if (distance < bestDistance) {
      best = element;
      bestDistance = distance;
    }
  });

  return best;
}

/**
 * Toggle a class on only the centered element.
 * @param {Element[]} elements
 * @param {string} className
 * @param {number} [viewportHeight]
 * @returns {Element|null}
 */
export function markCenteredElement(elements = [], className, viewportHeight) {
  const centered = findCenteredElement(elements, viewportHeight);
  elements.forEach(element => element.classList?.toggle(className, element === centered));
  return centered;
}
