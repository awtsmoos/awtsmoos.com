/* B"H
Layer commands: a source may rise one rung, sink one rung, or leap to crown/foundation.
The order of pixels becomes a ladder for the editor's will.
*/
import { selectedSource, moveSource, removeSource, addSource, reorderSource, moveSourceToEdge } from './graph/sceneGraph.js';
import { cloneSourceNode } from './graph/sourceNode.js';
import { nextId } from './state.js';
export { selectedSource, reorderSource };
export function moveSelected(state, delta) { return moveSource(state, state.selectedId, delta); }
export function moveSelectedTop(state) { return moveSourceToEdge(state, state.selectedId, 'top'); }
export function moveSelectedBottom(state) { return moveSourceToEdge(state, state.selectedId, 'bottom'); }
export function removeSelected(state) { return !!removeSource(state); }
export function duplicateSelected(state) {
  const source = selectedSource(state); if (!source || source.stream) return false;
  const copy = cloneSourceNode(source, { id:nextId(source.type), name:`${source.name} Copy`, x:source.x + 32, y:source.y + 32 });
  addSource(state, copy); return true;
}
export function nudgeSelected(state, dx, dy) { const source = selectedSource(state); if (!source || source.locked) return false; source.x += dx; source.y += dy; return true; }
