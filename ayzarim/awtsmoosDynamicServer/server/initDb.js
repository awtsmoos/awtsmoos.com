
// B"H

/**
 * B"H
 * Resolves the configured database path.
 *
 * @param {object} deps Dependency bag.
 * @param {string} directory Server directory.
 * @returns {string} Absolute DB path.
 */
function resolveDbPath(deps, directory) {
  if (typeof deps.config.dbPath === "string") {
    return deps.path.resolve(directory, deps.config.dbPath);
  }

  return deps.path.resolve(directory, "../../");
}

/**
 * B"H
 * Initializes DosDB.
 *
 * @param {object} deps Dependency bag.
 * @param {string} directory Server directory.
 * @returns {Promise<object>} DB instance.
 */
async function initDb(deps, directory) {
  process.awtsmoosDbPath = resolveDbPath(deps, directory);

  const db = new deps.DosDB(process.awtsmoosDbPath);
  await db.init();

  return db;
}

module.exports = { initDb, resolveDbPath };
