// B"H

/**
 * @file api/replication/index.js
 * @chapter A Mirror That Follows Quietly
 * @description Optional local replica snapshots built on the backup manager.
 */

class ReplicationManager {
  constructor(db) { this.db = db; this.targets = new Set(); }
  add(target) { this.targets.add(target); return { ok: true, target }; }
  remove(target) { return this.targets.delete(target); }
  sync() {
    const out = [];
    for (const target of this.targets) out.push(this.db.backup(target));
    return out;
  }
}

module.exports = ReplicationManager;
