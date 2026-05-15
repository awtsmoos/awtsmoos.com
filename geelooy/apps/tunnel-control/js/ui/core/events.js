
// B"H

/**
 * B"H
 * Adds an event listener only if the node exists.
 *
 * @param {EventTarget|null} node Event target.
 * @param {string} type Event type.
 * @param {Function} fn Listener.
 * @param {object|boolean} [options] Listener options.
 * @returns {void}
 */
export function on(node, type, fn, options) {
  if (!node) return;
  node.addEventListener(type, fn, options);
}

/**
 * B"H
 * Delegates events from a root.
 *
 * @param {Element|Document} root Root node.
 * @param {string} type Event type.
 * @param {string} selector Child selector.
 * @param {Function} fn Handler.
 * @returns {void}
 */
export function delegate(root, type, selector, fn) {
  root.addEventListener(type, event => {
    const target = event.target.closest(selector);
    if (!target || !root.contains(target)) return;
    fn(event, target);
  });
}

/**
 * B"H
 * Debounces a function.
 *
 * @param {Function} fn Callback.
 * @param {number} ms Delay.
 * @returns {Function} Debounced function.
 */
export function debounce(fn, ms = 120) {
  let timer = 0;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
