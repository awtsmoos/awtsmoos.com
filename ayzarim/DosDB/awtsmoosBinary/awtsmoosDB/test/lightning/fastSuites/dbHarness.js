
// B"H

/**
 * @file test/lightning/fastSuites/dbHarness.js
 * @chapter The Small Open World
 * @description
 * Opens and closes tiny DB worlds for focused validation.
 */

const AwtsmoosDB = require('../../../index.js');
const TempDbPath = require('./tempDb.js');

/**
 * @class DbHarness
 * @description
 * Controlled lifecycle for lightning DB probes.
 */
class DbHarness {
  /**
   * @constructor
   * @param {string} name - Suite name.
   */
  constructor(name) {
    this.name = name;
    this.file = TempDbPath.make(name);
    this.db = null;
  }

  /**
   * @method open
   * @description Opens a fresh DB.
   * @returns {AwtsmoosDB} DB instance.
   */
  open() {
    this.db = new AwtsmoosDB(this.file, {
      debug: false
    });
    this.db.open();
    return this.db;
  }

  /**
   * @method reopen
   * @description Closes and reopens the same DB.
   * @returns {AwtsmoosDB} Reopened DB instance.
   */
  reopen() {
    if (this.db) this.db.close();

    this.db = new AwtsmoosDB(this.file, {
      debug: false
    });
    this.db.open();

    return this.db;
  }

  /**
   * @method close
   * @description Closes and deletes the DB world.
   * @returns {void}
   */
  close() {
    if (this.db) {
      try {
        this.db.close();
      } catch (_err) {}
      this.db = null;
    }

    TempDbPath.remove(this.file);
  }
}

module.exports = DbHarness;
