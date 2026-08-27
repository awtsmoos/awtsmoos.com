// B"H

/**
 * @file awtsmoosDbBridge.js
 * @chapter The Parallel Vessel Of Search
 * @description
 * This bridge keeps the existing filesystem DosDB untouched while making the
 * unused binary AwtsmoosDB available in parallel for AI search, vector memory,
 * graph experiments, and future migration work.
 *
 * It is deliberately lazy. Requiring DosDB does not open a binary database.
 * A caller may create one only when desired through:
 *
 *   const aiDb = DosDB.awtsmoosDb("/path/to/ai-search.awtsdb");
 *   const aiDb = db.awtsmoosDb("ai-search.awtsdb");
 *
 * The returned database is a full AwtsmoosDB instance with its live handle at
 * aiDb.root, so future code can use live-handle features without coupling them
 * to the current production DosDB file layout.
 */

const path = require("path");
const AwtsmoosDB = require("./awtsmoosBinary/awtsmoosDB/index.js");

/**
 * @function resolveParallelPath
 * @description Resolves relative parallel DB paths beside the owning DosDB root.
 * @param {string} filePath Requested binary database path.
 * @param {object} [owner] Optional DosDB instance.
 * @returns {string} Absolute or normalized file path.
 */
function resolveParallelPath(filePath, owner) {
  if (!filePath || typeof filePath !== "string") {
    throw new TypeError("DosDB.awtsmoosDb requires a database file path.");
  }

  if (path.isAbsolute(filePath) || !owner || !owner.directory) {
    return filePath;
  }

  return path.join(owner.directory, filePath);
}

/**
 * @function createAwtsmoosDb
 * @description Creates and optionally opens a parallel AwtsmoosDB instance.
 * @param {string} filePath Binary database file path.
 * @param {object} [options={}] AwtsmoosDB options plus bridge options.
 * @param {object} [owner] Optional DosDB owner instance.
 * @returns {AwtsmoosDB} Opened AwtsmoosDB instance by default.
 */
function createAwtsmoosDb(filePath, options = {}, owner = null) {
  const {
    open = true,
    attachOwner = false,
    ...dbOptions
  } = options || {};

  const resolved = resolveParallelPath(filePath, owner);
  const db = new AwtsmoosDB(resolved, dbOptions);

  if (attachOwner) {
    Object.defineProperty(db, "dosdb", {
      value: owner || null,
      enumerable: false,
      configurable: true
    });
  }

  if (open && typeof db.open === "function") db.open();
  return db;
}

module.exports = {
  AwtsmoosDB,
  createAwtsmoosDb,
  resolveParallelPath
};
