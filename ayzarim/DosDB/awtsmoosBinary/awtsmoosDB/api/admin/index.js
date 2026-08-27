// B"H

/**
 * @file api/admin/index.js
 * @chapter The Window Over The City Of Bytes
 * @description Inspection helpers that page keys and report storage health.
 */

class AdminManager {
  constructor(db) { this.db = db; }

  report() {
    const info = this.db.info();
    const verify = this.db.verify();
    return { ...info, verifyOk: verify.ok, reachableBytes: verify.reachableBytes, errors: verify.errors };
  }

  list(handle = this.db.root, options = {}) {
    return this.db.keys(handle, {
      order: options.order || 'asc',
      offset: options.offset || 0,
      limit: options.limit === undefined ? 100 : options.limit
    });
  }

  entry(handle, key) {
    const value = handle ? handle[key] : undefined;
    const plain = this.db._plain(value);
    return { key, type: Array.isArray(plain) ? 'array' : plain === null ? 'null' : typeof plain, value: plain };
  }
}

module.exports = AdminManager;
