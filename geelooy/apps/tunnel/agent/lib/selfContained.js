// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Self-contained runtime bundles (Yaakov 2026-10-11 hard rule).
 * @description
 * ABSOLUTELY NOTHING in the installed tunnel may depend on the mw-repo being
 * present on the host. Every runtime module the agent needs beyond its own
 * directory ships as a versioned tarball from Awtsmoos.com and is downloaded,
 * hash-verified, and extracted into the install root on first use.
 *
 * Bundles (repo-relative paths preserved inside the tarball):
 *   merkava          — scripts/awtsmoos/MerkavaExecutor|MerkavaASTParser|compiling
 *   ssh-server       — ayzarim/ssh
 *   awtsmoosdb       — ayzarim/DosDB/awtsmoosBinary
 *   chatgpt-sentinel — geelooy/ai/js/chatgpt/sentinel
 *
 * Callers resolve files as path.join(bundleDir('merkava'),
 * 'scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js') — never with
 * ../../../../.. escapes into a repo that may not exist.
 */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const BUNDLES = Object.freeze({
	"merkava":          { marker: "scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js" },
	"merkava-shot":      { marker: "geelooy/apps/tunnel/downloads/merkava-shot/merkava-shot.bundle.cjs" },
	"ssh-server":       { marker: "ayzarim/ssh/server/Server.js" },
	"awtsmoosdb":       { marker: "ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js" },
	"chatgpt-sentinel": { marker: "geelooy/ai/js/chatgpt/sentinel/tokenClassLegacy.js" },
});

function bundleNames() {
	return Object.keys(BUNDLES);
}

function runtimeOrigin() {
	return (process.env.AWTSMOOS_RUNTIME_ORIGIN || "https://awtsmoos.com").replace(/\/$/, "");
}

/** The install root: env override, else the agent's own parent layout. */
function installRoot() {
	const explicit = (process.env.AWTSMOOS_INSTALL_ROOT || "").trim();
	if (explicit) return explicit;
	// lib/ -> agent root -> install root is the agent root's parent owner dir.
	// The agent dir itself is <installRoot>/agent (or the repo checkout in dev).
	return path.resolve(__dirname, "..");
}

function bundleDir(name) {
	if (!BUNDLES[name]) throw new Error(`unknown_runtime_bundle:${name}`);
	return path.join(installRoot(), "runtimes", name);
}

function bundleReady(name) {
	const dir = bundleDir(name);
	try {
		return fs.existsSync(path.join(dir, ".bundle-ok")) &&
			fs.existsSync(path.join(dir, BUNDLES[name].marker));
	} catch {
		return false;
	}
}

function sha256Hex(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

function downloadBytes(url) {
	return new Promise((resolve, reject) => {
		const req = require("node:https").get(url, { timeout: 120000 }, res => {
			if (res.statusCode !== 200) {
				res.resume();
				return reject(new Error(`runtime_bundle_http_${res.statusCode}`));
			}
			const chunks = [];
			res.on("data", c => chunks.push(c));
			res.on("end", () => resolve(Buffer.concat(chunks)));
			res.on("error", reject);
		});
		req.on("timeout", () => req.destroy(new Error("runtime_bundle_timeout")));
		req.on("error", reject);
	});
}

/**
 * Ensures a runtime bundle is present, verified, and extracted.
 * Downloads on first use; subsequent calls are a marker check.
 * @returns {Promise<string>} Absolute bundle directory.
 */
async function ensureBundle(name) {
	if (!BUNDLES[name]) throw new Error(`unknown_runtime_bundle:${name}`);
	if (bundleReady(name)) return bundleDir(name);
	const origin = runtimeOrigin();
	const base = `${origin}/api/tunnel/install/runtime/${name}.tar.gz`;
	const [archive, expected] = await Promise.all([
		downloadBytes(base),
		downloadBytes(`${base}.sha256`).then(b => b.toString("utf8").trim().split(/\s+/)[0]),
	]);
	if (sha256Hex(archive) !== expected) {
		throw new Error(`runtime_bundle_hash_mismatch:${name}`);
	}
	const dir = bundleDir(name);
	fs.rmSync(dir, { recursive: true, force: true });
	fs.mkdirSync(dir, { recursive: true });
	// Extract with the system tar (no new dependencies): strip nothing,
	// repo-relative paths are preserved inside the archive.
	const tmp = path.join(dir, "..", `${name}.tar.gz`);
	fs.writeFileSync(tmp, archive);
	try {
		execFileSync("tar", ["-xzf", tmp, "-C", dir], { timeout: 120000 });
	} finally {
		try { fs.unlinkSync(tmp); } catch {}
	}
	if (!bundleReadyMarkerOnly(dir, name)) {
		throw new Error(`runtime_bundle_incomplete:${name}`);
	}
	fs.writeFileSync(path.join(dir, ".bundle-ok"), `${name}\n`);
	return dir;
}

function bundleReadyMarkerOnly(dir, name) {
	try {
		return fs.existsSync(path.join(dir, BUNDLES[name].marker));
	} catch {
		return false;
	}
}

/** Resolve one file inside a bundle (ensures the bundle first). */
async function bundleFile(name, repoRelativePath) {
	const dir = await ensureBundle(name);
	const full = path.join(dir, repoRelativePath);
	if (!fs.existsSync(full)) throw new Error(`runtime_bundle_file_missing:${name}:${repoRelativePath}`);
	return full;
}

/** Synchronous read-only resolve: returns null when the bundle isn't present yet. */
function bundleFileIfReady(name, repoRelativePath) {
	if (!bundleReady(name)) return null;
	const full = path.join(bundleDir(name), repoRelativePath);
	return fs.existsSync(full) ? full : null;
}

module.exports = {
	BUNDLES,
	bundleNames,
	installRoot,
	bundleDir,
	bundleReady,
	ensureBundle,
	bundleFile,
	bundleFileIfReady,
	runtimeOrigin,
};
