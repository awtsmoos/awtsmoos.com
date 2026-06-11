/** B"H — a tiny event river for hits, sparks, pickups, and victory cries. */
export function createEvents() { const q = []; return { push: e => q.push(e), drain: () => q.splice(0) }; }
