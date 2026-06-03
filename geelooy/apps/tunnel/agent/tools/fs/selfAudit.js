// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");

/**
 * B"H
 * Chapter 397: The Self-Audit Learned The Text Scroll.
 *
 * The agent checks the same `manifest.txt` the installers consume: blessing,
 * version, entry, and file paths. No deprecated JSON vessel is opened.
 */
async function readManifest(full) {
  const lines = (await fsp.readFile(full, "utf8")).split(/\r?\n/).map(x => x.trim()).filter(Boolean).filter(x => x !== 'B"H' && x !== '# B"H');
  if (lines.length < 2) return null;
  return { version: lines[0], entry: lines[1], files: lines.slice(2) };
}
async function manifestCheck(config) {
  const manifestPath = safePath(config, "geelooy/apps/tunnel/agent/manifest.txt");
  let manifest;
  try { manifest = await readManifest(manifestPath); } catch (_e) { manifest = null; }
  const missing = [];
  if (!manifest || !manifest.entry || !manifest.files.length) return { ok: false, manifestPath, error: "manifest_invalid" };
  const agentRoot = path.dirname(manifestPath);
  for (const item of manifest.files) {
    try { await fsp.stat(path.join(agentRoot, item)); }
    catch (_e) { missing.push(item); }
  }
  return { ok: missing.length === 0, manifestPath, version: manifest.version, entry: manifest.entry, count: manifest.files.length, missing };
}
async function routeAudit(config) {
  const actionsPath = safePath(config, "geelooy/api/tunnel/control/docs/actions.js");
  delete require.cache[require.resolve(actionsPath)];
  const { actions } = require(actionsPath);
  return { ok: true, action: "routeAudit", actionsCount: actions.length, families: { fs: actions.filter(x => !x.startsWith("chrome") && !x.startsWith("command") && !x.startsWith("node")), command: actions.filter(x => x.startsWith("command") || x.startsWith("node")), chrome: actions.filter(x => x.startsWith("chrome")) }, duplicateActions: actions.filter((x, i) => actions.indexOf(x) !== i) };
}
async function agentSelfTest(config) {
  const manifest = await manifestCheck(config);
  const audit = await routeAudit(config);
  return { ok: manifest.ok && audit.ok && audit.duplicateActions.length === 0, action: "agentSelfTest", manifest, routeAudit: audit, node: process.version, platform: process.platform };
}
module.exports = { routeAudit, agentSelfTest };
