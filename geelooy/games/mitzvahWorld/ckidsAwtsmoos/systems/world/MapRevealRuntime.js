// B"H
/**
 * MapRevealRuntime
 * The Awtsmoos lets the map open like parchment, one remembered cell at a time.
 * Old emitMapReveal imports are preserved.
 */
export function revealMapCell(store = {}, cell = 'village_square') {
  const cells = store.mapCells || [];
  if (!cells.includes(cell)) cells.push(cell);
  store.mapCells = cells;
  return cells;
}
export function emitMapReveal(cell = 'village_square', detail = {}) {
  const payload = { cell, ...detail, at: Date.now() };
  globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:map-reveal', { detail: payload }));
  return payload;
}
export function revealAndEmit(store = {}, cell = 'village_square', detail = {}) {
  revealMapCell(store, cell);
  return emitMapReveal(cell, detail);
}
export default { revealMapCell, emitMapReveal, revealAndEmit };
