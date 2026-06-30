// B"H
import { applyPosition, mergePositions } from './layout.js';
export function bindRelayout({ desktop, surface, items, positions }) { const run = () => { Object.assign(positions, mergePositions(items, positions, surface)); surface.querySelectorAll('.desktop-icon').forEach(node => applyPosition(node, positions[node.dataset.id])); }; new ResizeObserver(run).observe(desktop); window.addEventListener('orientationchange', () => setTimeout(run, 180)); return run; }
/** B"H: rotation and resize no longer leave icons stranded. */
