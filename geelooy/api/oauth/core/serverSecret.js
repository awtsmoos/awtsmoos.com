
// B"H

const path = require("path");

/**
 * B"H
 * The exact fallback secret used by the Awtsmoos dynamic server.
 *
 * If the configured secret file cannot be loaded, the server does not crash.
 * It falls back to this object and then JSON.stringify seals it into the
 * token-signing secret. OAuth verification must do the same thing or the
 * signature will never match.
 *
 * @returns {string} JSON string fallback secret.
 */
function fallbackSecret() {
  return JSON.stringify({
    BH: 'B"H',
    noKey: "No security"
  });
}

/**
 * B"H
 * Safely loads a JSON or JS secret module.
 *
 * The file may live outside the public repo. If it cannot be found, that is
 * not automatically fatal, because the main server also tolerates that and
 * falls back to a default secret vessel.
 *
 * @param {string} absolutePath Absolute path to the configured secret file.
 * @returns {object} Load result.
 */
function tryLoadSecretFile(absolutePath) {
  try {
    const loaded = require(absolutePath);

    if (!loaded) {
      return {
        ok: false,
        error: "secret_file_loaded_empty"
      };
    }

    return {
      ok: true,
      secret: JSON.stringify(loaded),
      path: absolutePath
    };
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      path: absolutePath
    };
  }
}

/**
 * B"H
 * Resolves the configured secret path the same way the dynamic server does.
 *
 * The dynamic server uses:
 * this.directory + config.secret
 *
 * process.env.__awtsdir is set to the server directory, so this reproduces
 * that same path, then falls back exactly like the server if the require fails.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Result with ok, secret, source, and optional detail.
 */
function resolveSecretFromConfig($i) {
  const config = $i.config || {};
  const secretPath = config.secret;

  if (typeof secretPath !== "string") {
    return {
      ok: true,
      secret: fallbackSecret(),
      source: "fallback_no_config_secret"
    };
  }

  const baseDir = process.env.__awtsdir || process.cwd() + "/";
  const directPath = baseDir + secretPath;
  const resolvedPath = path.resolve(baseDir, secretPath);

  const direct = tryLoadSecretFile(directPath);

  if (direct.ok) {
    return {
      ok: true,
      secret: direct.secret,
      source: "config_secret_direct",
      path: direct.path
    };
  }

  const resolved = tryLoadSecretFile(resolvedPath);

  if (resolved.ok) {
    return {
      ok: true,
      secret: resolved.secret,
      source: "config_secret_resolved",
      path: resolved.path
    };
  }

  return {
    ok: true,
    secret: fallbackSecret(),
    source: "fallback_after_secret_load_failed",
    details: {
      direct,
      resolved
    }
  };
}

/**
 * B"H
 * Resolves the Awtsmoos server secret used by token validation.
 *
 * First it uses $i.self.secret if the dynamic server exposes it.
 * If not, it reproduces the server config-secret loading behavior.
 * If that fails, it uses the same fallback as the server.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Result object with ok, secret, source, and optional details.
 */
function resolveServerSecret($i) {
  if ($i.self) {
    if (typeof $i.self.secret === "string") {
      return {
        ok: true,
        secret: $i.self.secret,
        source: "$i.self.secret"
      };
    }
  }

  return resolveSecretFromConfig($i);
}

module.exports = {
  resolveServerSecret,
  resolveSecretFromConfig,
  fallbackSecret,
  tryLoadSecretFile
};
