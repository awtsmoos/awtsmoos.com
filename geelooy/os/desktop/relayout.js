// B"H
import { applyPosition, mergePositions } from './layout.js';

export function bindRelayout({ desktop, surface, items, positions }) {
  const run = () => {
    Object.assign(positions, mergePositions(items, positions, surface));
    placeIcons(surface, positions);
    sizeSurfaceForIcons(surface, positions);
  };
  new ResizeObserver(run).observe(desktop);
  window.addEventListener('orientationchange', () => setTimeout(run, 180));
  run();
  return run;
}

function placeIcons(surface, positions) {
  surface.querySelectorAll('.desktop-icon').forEach(node => applyPosition(node, positions[node.dataset.id]));
}

function sizeSurfaceForIcons(surface, positions) {
  const bottom = Math.max(0, ...Object.values(positions).map(point => (point?.y || 0) + 156));
  surface.style.minHeight = `${Math.max(surface.clientHeight || 0, bottom)}px`;
}

/** B"H: resize and rotation now preserve scrollable space for overflowing icons. */
