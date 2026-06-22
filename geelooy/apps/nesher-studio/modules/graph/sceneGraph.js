/* B"H */
export function makeScene(id, name, sources = []) { return { id, name, sources }; }
export function currentScene(state) { return state.scenes.find(scene => scene.id === state.currentSceneId) || state.scenes[0]; }
export function getSources(state) { return currentScene(state)?.sources || []; }
export function selectedSource(state) { return getSources(state).find(source => source.id === state.selectedId) || null; }
export function addSource(state, source) { getSources(state).push(source); state.selectedId = source.id; return source; }
export function removeSource(state, id = state.selectedId) {
  const sources = getSources(state); const index = sources.findIndex(source => source.id === id); if (index < 0) return null;
  const [source] = sources.splice(index, 1); stopSource(source); state.selectedId = sources[Math.min(index, sources.length - 1)]?.id || null; return source;
}
export function moveSource(state, id, delta) {
  const sources = getSources(state); const index = sources.findIndex(source => source.id === id); const next = index + delta;
  if (index < 0 || next < 0 || next >= sources.length) return false; const [source] = sources.splice(index, 1); sources.splice(next, 0, source); return true;
}
export function reorderSource(state, draggedId, targetId) {
  const sources = getSources(state); const from = sources.findIndex(s => s.id === draggedId); const to = sources.findIndex(s => s.id === targetId);
  if (from < 0 || to < 0 || from === to) return false; const [source] = sources.splice(from, 1); sources.splice(to, 0, source); state.selectedId = draggedId; return true;
}
function stopSource(source) { source.stream?.getTracks?.().forEach(track => track.stop()); if (source.node?.remove && source.type === 'browser') source.node.remove(); if (source.node?.remove && source.type === 'iframe') source.node.remove(); }
