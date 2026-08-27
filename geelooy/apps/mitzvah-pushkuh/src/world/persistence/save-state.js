// B"H
// Save snapshots are compact memories, not whole universes.
export function snapshot(entries = [], world = {}) { return { v: 1, at: Date.now(), entries, world }; }
export function restore(data) { return data?.v ? data : { v: 1, at: Date.now(), entries: [], world: {} }; }
