
// B"H

/**
 * B"H
 * Loads the configured secret object.
 *
 * @param {object} deps Dependency bag.
 * @param {string} directory Server directory.
 * @returns {object} Secret object.
 */
function loadSecret(deps, directory) {
  if (typeof deps.config.secret !== "string") {
    return null;
  }

  try {
    return require(directory + deps.config.secret);
  } catch (e) {
    return { BH: "B\"H", noKey: "No security" };
  }
}

/**
 * B"H
 * Installs session middleware when a secret exists.
 *
 * @param {object} server Server instance.
 * @param {object} deps Dependency bag.
 * @param {string} directory Server directory.
 * @returns {void}
 */
function installAuth(server, deps, directory) {
  const secret = loadSecret(deps, directory);
  if (!secret) return;

  server.secret = JSON.stringify(secret);

  const awtsAuth = new deps.Auth(server.secret);
  server.use(awtsAuth.sessionMiddleware.bind(awtsAuth));
}

module.exports = { loadSecret, installAuth };
