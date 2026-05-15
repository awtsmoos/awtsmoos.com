// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");

/**
 * B"H
 * Reads JSON safely.
 *
 * @param {string} full Absolute path.
 * @returns {Promise<object|null>} JSON or null.
 */
async function readJson(full) {
  try { return JSON.parse(await fsp.readFile(full, "utf8")); }
  catch (_e) { return null; }
}

/**
 * B"H
 * Checks that every manifest file exists.
 *
 * @param {object} config Agent config.
 * @returns {Promise<object>} Manifest result.
 */
async function manifestCheck(config) {
  const manifestPath = safePath(config, "geelooy/apps/tunnel/agent/manifest.json");
  const manifest = await readJson(manifestPath);
  const missing = [];

  if (!manifest || !Array.isArray(manifest.files)) {
    return { ok: false, manifestPath, error: "manifest_invalid" };
  }

  const agentRoot = path.dirname(manifestPath);

  for (const item of manifest.files) {
    const full = path.join(agentRoot, item.path);
    try { await fsp.stat(full); }
    catch (_e) { missing.push(item.path); }
  }

  return {
    ok: missing.length === 0,
    manifestPath,
    version: manifest.version,
    count: manifest.files.length,
    missing
  };
}

/**
 * B"H
 * Compares action catalog against broad handler families.
 *
 * @param {object} config Agent config.
 * @returns {Promise<object>} Audit.
 */
async function routeAudit(config) {
  const actionsPath = safePath(config, "geelooy/api/tunnel/control/docs/actions.js");
  delete require.cache[require.resolve(actionsPath)];
  const { actions } = require(actionsPath);

  const families = {
    fs: actions.filter(x => !x.startsWith("chrome") && !x.startsWith("command") && !x.startsWith("node")),
    command: actions.filter(x => x.startsWith("command") || x.startsWith("node")),
    chrome: actions.filter(x => x.startsWith("chrome"))
  };

  return {
    ok: true,
    action: "routeAudit",
    actionsCount: actions.length,
    families,
    duplicateActions: actions.filter((x, i) => actions.indexOf(x) !== i)
  };
}

/**
 * B"H
 * Runs a light self-test without destructive commands.
 *
 * @param {object} config Agent config.
 * @returns {Promise<object>} Self test.
 */
async function agentSelfTest(config) {
  const manifest = await manifestCheck(config);
  const audit = await routeAudit(config);

  return {
    ok: manifest.ok && audit.ok && audit.duplicateActions.length === 0,
    action: "agentSelfTest",
    manifest,
    routeAudit: audit,
    node: process.version,
    platform: process.platform
  };
}

module.exports = { routeAudit, agentSelfTest };
