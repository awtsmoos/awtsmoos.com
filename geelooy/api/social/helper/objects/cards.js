// B"H
/** Chapter 591: Every object gains a compact living card. */
const { objectType } = require('./registry.js');
function objectCard(object = {}) {
  const reg = objectType(object.type);
  return { key: object.key, type: object.type, id: object.id, icon: reg.icon, semantic: reg.semantic, title: object.title, summary: object.summary, creator: object.creator, tags: object.tags || [], health: object.health || null, updatedAt: object.updatedAt };
}
module.exports = { objectCard };
