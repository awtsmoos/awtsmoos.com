
// B"H

/**
 * B"H
 * Loads optional Firebase/log key from config.logFile.
 *
 * @param {object} deps Dependency bag.
 * @returns {Promise<object|null>} Parsed key or null.
 */
async function loadLogKey(deps) {
  if (!deps.config || !deps.config.logFile) return null;

  try {
    const key = await deps.fs.readFile(deps.config.logFile);
    return JSON.parse(key.toString());
  } catch (e) {
    return null;
  }
}

module.exports = { loadLogKey };
