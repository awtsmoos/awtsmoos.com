// B"H

/**
 * @file api/firebase/index.js
 * @chapter Aysh Yesod Paths
 * @description Firebase-style refs over AwtsmoosDB without polluting handles.
 */

class FirebaseFacade {
  constructor(db) { this.db = db; }
  ref(path = '') { return new Ref(this.db, path); }
}

class Ref {
  constructor(db, path) { this.db = db; this.path = path; }
  child(part) { return new Ref(this.db, [this.path, part].filter(Boolean).join('/')); }
  set(value) { const slot = slotFor(this.db, this.path, true); slot.parent[slot.key] = value; return value; }
  get() { const slot = slotFor(this.db, this.path, false); return slot.parent ? slot.parent[slot.key] : undefined; }
  remove() { const slot = slotFor(this.db, this.path, false); if (!slot.parent) return false; return delete slot.parent[slot.key]; }
  update(patch) {
    const value = this.get() || {};
    for (const key of Object.keys(patch || {})) value[key] = patch[key];
    return this.set(value);
  }
  push(value) {
    const key = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const child = this.child(key);
    if (arguments.length) child.set(value);
    return child;
  }
}

function slotFor(db, refPath, create) {
  if (!db.root.__firebase__) db.root.__firebase__ = {};
  const parts = String(refPath || '').split('/').filter(Boolean);
  const key = parts.pop() || '_';
  let parent = db.root.__firebase__;
  for (const part of parts) {
    if (parent[part] === undefined) {
      if (!create) return { parent: null, key };
      parent[part] = {};
    }
    parent = parent[part];
  }
  return { parent, key };
}

module.exports = FirebaseFacade;
