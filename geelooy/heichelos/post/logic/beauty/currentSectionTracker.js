// B"H
/**
 * Chapter 327: Track the current section once, and only once.
 * The Awtsmoos reveals the visible chunk without multiplying observers when
 * delayed boot passes re-run the beauty blessing, and the module also behaves
 * inside Node tests where `window` may not exist.
 */

const STATE_KEY = '__awtsmoosCurrentSectionTracker';

function vessel() {
  return typeof window !== 'undefined' ? window : globalThis;
}

export function bindCurrentSectionTracker({ onCurrent = () => {} } = {}) {
  const world = vessel();
  const previous = world[STATE_KEY];
  if (previous?.disconnect) previous.disconnect();

  const sections = [...document.querySelectorAll('#realPost .scroll-chunk')];
  if (!sections.length || typeof IntersectionObserver === 'undefined') {
    world[STATE_KEY] = { disconnect: () => {}, count: sections.length, inactive: true };
    return world[STATE_KEY].disconnect;
  }

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sections.forEach(section => section.classList.toggle('is-current-section', section === visible.target));
    onCurrent(visible.target);
  }, { threshold: [0.25, 0.45, 0.65] });

  sections.forEach(section => observer.observe(section));
  const disconnect = () => observer.disconnect();
  world[STATE_KEY] = { disconnect, count: sections.length, inactive: false };
  return disconnect;
}

export function getCurrentSectionTrackerState() {
  return vessel()[STATE_KEY] || null;
}
