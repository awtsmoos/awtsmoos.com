// B"H
/**
 * Chapter 330: Seek the invisible wall, but not on every breath.
 * Layout scans are expensive, so the detector caches unless explicitly forced.
 */

const CACHE_MS = 2200;
let lastScan = { at: 0, blockers: [] };

export function detectScrollBlockers(root = document, { force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastScan.at < CACHE_MS) return lastScan.blockers;

  const viewportArea = innerWidth * innerHeight;
  const blockers = [...root.querySelectorAll('body *')]
    .map(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const area = Math.max(0, rect.width) * Math.max(0, rect.height);
      return { node, style, area };
    })
    .filter(item => item.area > viewportArea * .45)
    .filter(item => item.style.position === 'fixed' || item.style.position === 'sticky')
    .filter(item => item.style.pointerEvents !== 'none')
    .map(item => ({
      tag: item.node.tagName,
      id: item.node.id,
      className: item.node.className,
      position: item.style.position,
      area: Math.round(item.area)
    }));

  lastScan = { at: now, blockers };
  window.__awtsmoosScrollBlockers = blockers;
  if (blockers.length) console.warn('B"H possible scroll blockers', blockers);
  return blockers;
}

export function resetScrollBlockerCache() {
  lastScan = { at: 0, blockers: [] };
}
