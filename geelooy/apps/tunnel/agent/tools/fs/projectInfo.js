// B"H
const fsp = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");

/**
 * B"H
 * Reads JSON if present.
 *
 * @param {string} full Absolute path.
 * @returns {Promise<object|null>} JSON or null.
 */
async function readJsonMaybe(full) {
  try { return JSON.parse(await fsp.readFile(full, "utf8")); }
  catch (_e) { return null; }
}

/**
 * B"H
 * Returns package metadata and scripts without shelling out.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Package info.
 */
async function packageInfo(config, payload = {}) {
  const base = safePath(config, payload.path || payload.p || ".");
  const pkgPath = path.basename(base) === "package.json" ? base : path.join(base, "package.json");
  const pkg = await readJsonMaybe(pkgPath);

  if (!pkg) return { ok: false, action: "packageInfo", error: "package_json_not_found_or_invalid", path: payload.path || payload.p || "." };

  const dir = path.dirname(pkgPath);
  const lockfiles = [];

  for (const name of ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb"]) {
    try { await fsp.stat(path.join(dir, name)); lockfiles.push(name); }
    catch (_e) {}
  }

  const manager =
    lockfiles.includes("pnpm-lock.yaml") ? "pnpm" :
    lockfiles.includes("yarn.lock") ? "yarn" :
    lockfiles.includes("bun.lockb") ? "bun" :
    lockfiles.includes("package-lock.json") ? "npm" : "unknown";

  return {
    ok: true,
    action: "packageInfo",
    path: path.relative(config.root, pkgPath).replace(/\\/g, "/"),
    absolutePath: pkgPath,
    name: pkg.name || "",
    version: pkg.version || "",
    type: pkg.type || "",
    manager,
    lockfiles,
    scripts: pkg.scripts || {},
    dependencies: Object.keys(pkg.dependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {})
  };
}

/**
 * B"H
 * Gives a compact project overview for first-contact inspection.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Overview.
 */
async function projectOverview(config, payload = {}) {
  const root = safePath(config, payload.path || payload.p || ".");
  const entries = await fsp.readdir(root, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name).slice(0, 80);
  const files = entries.filter(e => e.isFile()).map(e => e.name).slice(0, 120);
  const pkg = await packageInfo(config, payload).catch(e => ({ ok: false, error: e.message }));

  return {
    ok: true,
    action: "projectOverview",
    path: payload.path || payload.p || ".",
    absolutePath: root,
    platform: process.platform,
    node: process.version,
    dirs,
    files,
    package: pkg.ok ? pkg : null,
    hints: {
      hasPackageJson: files.includes("package.json"),
      hasGit: dirs.includes(".git"),
      hasNodeModules: dirs.includes("node_modules"),
      likelyWeb: dirs.includes("src") || dirs.includes("app") || dirs.includes("public")
    }
  };
}

module.exports = { packageInfo, projectOverview };
