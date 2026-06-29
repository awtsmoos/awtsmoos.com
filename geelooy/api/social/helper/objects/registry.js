// B"H
/** Chapter 588: Object types receive icons, colors, render hints, and verbs. */
const TYPES = {
  alias: ['👤', 'presence'], post: ['📜', 'knowledge'], series: ['🧵', 'knowledge'], comment: ['💬', 'conversation'],
  file: ['📄', 'creation'], folder: ['📁', 'creation'], window: ['🪟', 'presence'], program: ['🧰', 'ai'],
  mail: ['✉️', 'conversation'], notification: ['🔔', 'presence'], proposal: ['⚖️', 'governance'], agent: ['🤖', 'ai'],
  workspace: ['🧭', 'creation'], thought: ['💡', 'memory'], event: ['⚡', 'presence'], object: ['◈', 'knowledge']
};
function objectType(type = 'object') {
  const [icon, semantic] = TYPES[type] || TYPES.object;
  return { type, icon, semantic, card: true, timeline: true, inspector: true, search: true };
}
function listTypes() { return Object.keys(TYPES).map(objectType); }
module.exports = { objectType, listTypes };
