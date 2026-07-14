// B"H
/** Local reaction storage: temporary campus likes until the backend vessel opens. */
const KEY = 'geelooy-college-feed-reactions';
export const REACTIONS = [
  ['like', '👍', 'Like'], ['love', '💙', 'Love'], ['helpful', '📚', 'Helpful'],
  ['funny', '😂', 'Funny'], ['study', '🧠', 'Study'], ['rsvp', '✅', 'RSVP']
];
export function readReactionState(storage = localStorage) {
  try { return JSON.parse(storage.getItem(KEY) || '{}'); }
  catch { return {}; }
}
export function toggleReaction(objectId, reaction, storage = localStorage) {
  const state = readReactionState(storage);
  const row = state[objectId] || {};
  row[reaction] = !row[reaction];
  state[objectId] = row;
  storage.setItem(KEY, JSON.stringify(state));
  return row;
}
export function reactionSummary(objectId, counts = {}, storage = localStorage) {
  const row = readReactionState(storage)[objectId] || {};
  const active = Object.entries(row).filter(([, value]) => value).map(([name]) => name);
  const base = counts.reactions || 0;
  return { active, total: base + active.length, row };
}
