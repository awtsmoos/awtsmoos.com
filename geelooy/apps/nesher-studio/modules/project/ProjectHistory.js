/* B"H
Project history: commands leave footprints so undo can walk backward.
*/
export function createProjectHistory() { return { past:[], future:[] }; }
export function pushProjectState(history, state) { history.past.push(JSON.stringify(state)); history.future.length = 0; return history; }
export function undoProjectState(history, current) { const prev = history.past.pop(); if (!prev) return current; history.future.push(JSON.stringify(current)); return JSON.parse(prev); }
