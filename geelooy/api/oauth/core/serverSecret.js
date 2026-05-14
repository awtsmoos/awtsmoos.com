
// B"H
const path = require("path");

/**
 * B"H
 * Fallback secret used only when no configured server secret can be reached.
 *
 * IMPORTANT:
 * Token creation and token validation must use the exact same secret resolver,
 * otherwise signatures will never validate.
 */
function fallbackSecret() {
  return JSON.stringify({
    BH: "B\"H",
    noKey: "No security"
  });
}

function tryLoadSecretFile(absolutePath) {
  try {
    const loaded = require(absolutePath);

    if (!loaded) {
      return {
        ok: false,
        error: "secret_file_loaded_empty",
        path: absolutePath
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

function configFromContext($i) {
  return (
    $i?.config ||
    $i?.server?.config ||
    global.config ||
    {}
  );
}

function selfFromContext($i) {
  return (
    $i?.self ||
    $i?.server ||
    global.server ||
    null
  );
}

function resolveSecretFromConfig($i) {
  const config = configFromContext($i);
  const secretPath = config.secret;

  if (typeof secretPath !== "string" || !secretPath) {
    return {
      ok: true,
      secret: fallbackSecret(),
      source: "fallback_no_config_secret"
    };
  }

  const baseDir =
    process.env.__awtsdir ||
    process.env.AWTSMOOS_DIR ||
    process.cwd();

  const resolvedPath = path.resolve(baseDir, secretPath);
  const directPath = String(baseDir).replace(/[\\\/]?$/, "/") + secretPath;

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
 * Resolves the exact secret for OAuth token signing and validation.
 *
 * This function MUST NOT crash if $i is missing or partial.
 * Earlier token.js called resolveServerSecret() without $i; this version
 * tolerates that and falls back safely.
 *
 * @param {object=} $i Awtsmoos route context.
 * @returns {{ok:boolean, secret:string, source:string, details?:object}}
 */
function resolveServerSecret($i) {
  const self = selfFromContext($i);

  if (self && typeof self.secret === "string" && self.secret) {
    return {
      ok: true,
      secret: self.secret,
      source: "$i.self.secret"
    };
  }

  return resolveSecretFromConfig($i);
}

function secretString($i) {
  const got = resolveServerSecret($i);
  return got.secret;
}

module.exports = {
  resolveServerSecret,
  resolveSecretFromConfig,
  fallbackSecret,
  tryLoadSecretFile,
  secretString
};
