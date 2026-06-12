// B"H
/**
 * @file createRafScrollBinder.js
 * @description
 * The Awtsmoos creates every pixel from nothing every instant, yet the browser
 * must not be forced to recalculate the palace on every scroll spark. This tiny
 * vessel gathers scroll and resize storms into one requestAnimationFrame breath,
 * so Android Chrome keeps its native river while visual states receive truth.
 */

function frameScheduler() {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame;
  return callback => setTimeout(callback, 16);
}

function defaultTarget() {
  if (typeof window !== 'undefined' && window?.addEventListener) return window;
  if (globalThis?.addEventListener) return globalThis;
  return null;
}

function listenTarget(target) {
  if (target?.addEventListener) return target;
  return defaultTarget();
}

/**
 * Bind passive viewport events and run update at most once per animation frame.
 * The first update is synchronous so tests and first paint receive state before
 * the next scroll breath; later events are frame-bound.
 * @param {object} options
 * @param {Function} options.update - The visual state refresh function.
 * @param {EventTarget} [options.target=window] - Event source.
 * @param {string[]} [options.events] - Events to bind.
 * @param {boolean} [options.immediate=true] - Whether to refresh immediately.
 * @returns {Function} cleanup function.
 */
export function bindRafViewportUpdates({
  update,
  target = defaultTarget(),
  events = ['scroll', 'resize'],
  immediate = true
} = {}) {
  const source = listenTarget(target);
  if (!source || typeof update !== 'function') return () => {};

  const scheduleFrame = frameScheduler();
  let queued = false;
  let disposed = false;

  const run = () => {
    queued = false;
    if (!disposed) update();
  };

  const schedule = () => {
    if (queued || disposed) return;
    queued = true;
    scheduleFrame(run);
  };

  events.forEach(eventName => source.addEventListener(eventName, schedule, { passive: true }));
  if (immediate) update();

  return () => {
    disposed = true;
    events.forEach(eventName => source.removeEventListener(eventName, schedule));
  };
}
