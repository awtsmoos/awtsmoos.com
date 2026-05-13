
// B"H

/**
 * @file test/lightning/fastSuites/tempDb.js
 * @chapter The Temporary World
 * @description
 * Creates tiny disposable DB paths for lightning mini suites.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const TEMP_DIR = path.join(ROOT, 'test', '.lightning_tmp');

/**
 * @class TempDbPath
 * @description
 * Creates and removes tiny DB test files.
 */
class TempDbPath {
  /**
   * @static
   * @method ensureDir
   * @description Ensures temp folder exists.
   * @returns {void}
   */
  static ensureDir() {
    fs.mkdirSync(TEMP_DIR, {
      recursive: true
    });
  }

  /**
   * @static
   * @method make
   * @description Creates a fresh database file path.
   * @param {string} name - Logical test name.
   * @returns {string} Absolute DB path.
   */
  static make(name) {
    this.ensureDir();
    const safe = name.replace(/[^a-z0-9_-]/gi, '_');
    return path.join(TEMP_DIR, `${safe}_${process.pid}_${Date.now()}.db`);
  }

  /**
   * @static
   * @method remove
   * @description Removes a DB path and sidecar artifacts.
   * @param {string} dbPath - DB path.
   * @returns {void}
   */
  static remove(dbPath) {
    for (const suffix of ['', '-wal', '-shm']) {
      try {
        fs.rmSync(`${dbPath}${suffix}`, {
          force: true
        });
      } catch (_err) {}
    }
  }

  /**
   * @static
   * @method cleanDir
   * @description Removes the entire lightning temp folder.
   * @returns {void}
   */
  static cleanDir() {
    try {
      fs.rmSync(TEMP_DIR, {
        recursive: true,
        force: true
      });
    } catch (_err) {}
  }
}

module.exports = TempDbPath;
