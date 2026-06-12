// B"H
/**
 * @file scrollBlockerDetector.js
 * @description
 * Chapter 330 rewritten: seek the invisible wall without searching every grain
 * of the world. The Awtsmoos sees all nodes at once; Android Chrome does not.
 * This detector scans likely overlay vessels first, caches the result, and only
 * measures candidates that could plausibly block native reading scroll.
 */

const CACHE_MS = 2200;
const BLOCKER_SELECTOR = [
  '[role="dialog"]',
  '[aria-modal="true"]',
  '.modal',
  '.overlay',
  '.drawer',
  '.sidebar',
  '.command-palette',
  '.floating-controls',
  '.bottom-nav',
  '.heichel-mobile-topbar',
  '.awtsmoos-progress-spine',
  '.reader-sidebar',
  '.reader-overlays',
  '.post-reader-controls'
].join(',');

let lastScan = { at: 0, blockers: [] };

function viewportArea() {
  const width = typeof innerWidth === 'number' ? innerWidth : document.documentElement.clientWidth || 1;
  const height = typeof innerHeight === 'number' ? innerHeight : document.documentElement.clientHeight || 1;
  return width * height;
}

function candidateNodes(root) {
  const scope = root?.querySelectorAll ? root : document;
  return [...scope.querySelectorAll(BLOCKER_SELECTOR)];
}

function blockerSnapshot(node, area, style) {
  return {
    tag: node.tagName,
    id: node.id,
    className: String(node.className || ''),
    position: style.position,
    area: Math.round(area)
  };
}

function inspectCandidate(node, minimumArea) {
  const style = getComputedStyle(node);
  if (style.pointerEvents === 'none') return null;
  if (style.visibility === 'hidden' || style.display === 'none') return null;
  if (style.position !== 'fixed' && style.position !== 'sticky') return null;

  const rect = node.getBoundingClientRect();
  const area = Math.max(0, rect.width) * Math.max(0, rect.height);
  if (area <= minimumArea) return null;
  return blockerSnapshot(node, area, style);
}

/**
 * Detect large fixed/sticky overlays likely to block native scroll.
 * @param {ParentNode} root
 * @param {object} options
 * @param {boolean} options.force
 * @returns {Array<object>}
 */
export function detectScrollBlockers(root = document, { force = false } = {}) {
  const now = Date.now();
  if (!force && now - lastScan.at < CACHE_MS) return lastScan.blockers;

  const minimumArea = viewportArea() * 0.45;
  const blockers = candidateNodes(root)
    .map(node => inspectCandidate(node, minimumArea))
    .filter(Boolean);

  lastScan = { at: now, blockers };
  if (typeof window !== 'undefined') window.__awtsmoosScrollBlockers = blockers;
  if (blockers.length) console.warn('B"H possible scroll blockers', blockers);
  return blockers;
}

export function resetScrollBlockerCache() {
  lastScan = { at: 0, blockers: [] };
}

export const __testing = { BLOCKER_SELECTOR };
