// B"H
export function pushHistory(state, path) { state.history = state.history || { back:[], forward:[] }; if (state.currentPath && state.currentPath !== path) state.history.back.push(state.currentPath); state.history.forward = []; }
export function backPath(state) { const h = state.history || { back:[], forward:[] }; const path = h.back.pop(); if (path) h.forward.push(state.currentPath); return path; }
export function forwardPath(state) { const h = state.history || { back:[], forward:[] }; const path = h.forward.pop(); if (path) h.back.push(state.currentPath); return path; }
/** B"H: back and forward become remembered roads, not decorative arrows. */
