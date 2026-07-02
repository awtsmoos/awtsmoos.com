// B"H
import { applyPosition, mergePositions, sizeSurfaceForItems } from './layout.js';

export function bindRelayout({ desktop, surface, items, positions }) {
  const run = () => {
    Object.assign(positions, mergePositions(items, positions, surface));
    placeIcons(surface, positions);
    sizeSurfaceForItems(surface, items, positions);
  };
  new ResizeObserver(run).observe(desktop);
  window.addEventListener('orientationchange', () => setTimeout(run, 180));
  run();
  return run;
}

function placeIcons(surface, positions) {
  surface.querySelectorAll('.desktop-icon').forEach(node => {
    applyPosition(node, positions[node.dataset.id]);
  });
}

/** B"H: relayout now grows the desktop scroll universe before icons disappear below it. */
