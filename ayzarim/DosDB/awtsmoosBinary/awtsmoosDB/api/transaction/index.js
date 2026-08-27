// B"H

/**
 * @file api/transaction/index.js
 * @chapter Return Before The Ink Dries
 * @description Rollback transactions using a durable root snapshot journal.
 */
const TransactionJournal = require('./journal.js');

class TransactionManager {
  constructor(db) {
    this.db = db;
    this.journal = new TransactionJournal(db);
  }

  run(fn) {
    const before = this.db._plain(this.db.root);
    this.journal.begin(before);
    try {
      const result = this.db.batch(fn);
      this.db.waitForIdle({ closing: false });
      this.journal.commit();
      return { ok: true, result };
    } catch (err) {
      this.journal.restoreRoot(before);
      this.db.waitForIdle({ closing: false });
      this.journal.abort();
      return { ok: false, error: err };
    }
  }

  recover() {
    return this.journal.recover();
  }
}

module.exports = TransactionManager;
