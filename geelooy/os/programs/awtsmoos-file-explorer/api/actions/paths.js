// B"H
import { joinExplorerPath } from '../path.js';
export function selectedPaths(controller) { return controller.selection().paths; }
export function selectedItems(controller) { const set = new Set(selectedPaths(controller)); return controller.getRenderItems().filter(item => set.has(item.path)); }
export function targetPath(state, name) { return joinExplorerPath(state.currentPath, name); }
export function nameOf(path = '') { return String(path).split('/').filter(Boolean).pop() || 'item'; }
/** B"H: paths are gathered once so buttons stop guessing. */
