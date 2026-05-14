
// B"H

/**
 * B"H
 * Resolves the Awtsmoos server secret used by the main dynamic server.
 *
 * The dynamic server creates tokens with JSON.stringify(secretFileContents).
 * OAuth must validate bearer tokens with the same exact secret string.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Result object with ok/secret or error.
 */
function resolveServerSecret($i) {
  try {
    if ($i.self && typeof $i.self.secret === "string") {
      return {
        ok: true,
        secret: $i.self.secret,
        source: "$i.self.secret"
      };
    }

    if (typeof process !== "undefined" && process.env && process.env.__awtsdir) {
      const config = $i.config || {};
      const secretPath = config.secret;

      if (typeof secretPath === "string" && secretPath.length) {
        const loaded = require(process.env.__awtsdir + secretPath);

        return {
          ok: true,
          secret: JSON.stringify(loaded),
          source: "process.env.__awtsdir + config.secret"
        };
      }
    }

    return {
      ok: false,
      error: "server_secret_not_found"
    };
  } catch (e) {
    return {
      ok: false,
      error: e.stack || e.message
    };
  }
}

module.exports = { resolveServerSecret };
