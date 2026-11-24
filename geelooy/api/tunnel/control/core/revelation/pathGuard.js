//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Filesystem boundary guard enforced by server/agent, never by the AI alone.
 * @description Rejects traversal, absolute escapes, symlink escapes and
 * sensitive files (.env, keys, credentials) before any filesystem operation.
 */

const fs = require("fs");
const path = require("path");

const SENSITIVE = /(^|\/)(\.env(\..*)?|\.ssh|id_rsa.*|.*\.(pem|key)|credentials.*|.*secret.*)$/i;

/**
 * Resolves `rel` inside `root`, following symlinks for existing ancestors.
 * @param {string} root Authorized project root (must exist).
 * @param {string} rel Requested relative path.
 * @param {{allowSensitive?:boolean}} [opts]
 * @returns {{ok:boolean, reason?:string, absolute?:string}} Verdict.
 */
function resolveInside(root, rel, opts = {}) {
	if (!root || typeof rel !== "string" || !rel) return deny("root and path are required");
	if (rel.includes("\0")) return deny("null byte in path");
	if (path.isAbsolute(rel)) return deny("absolute paths are not accepted; use a project-relative path");
	const rootAbs = fs.realpathSync(root);
	const joined = path.resolve(rootAbs, rel);
	if (!isInside(rootAbs, joined)) return deny("path traversal outside project root");
	if (!opts.allowSensitive && SENSITIVE.test(rel.replace(/\\/g, "/"))) return deny("sensitive file access requires explicit authorization");
	// Symlink escape: walk existing ancestors and re-check their real targets.
	let probe = joined;
	while (!fs.existsSync(probe) && probe !== rootAbs) probe = path.dirname(probe);
	const real = fs.realpathSync(probe);
	if (!isInside(rootAbs, real)) return deny("symlink escape outside project root");
	return { ok: true, absolute: joined };
}

/**
 * Pure relative-path check for trust boundaries that do not yet know the
 * project root (the control layer). Absolute paths are left to the agent,
 * which resolves them against the authorized root with resolveInside.
 * @param {string} rel Candidate path value.
 * @returns {{ok:boolean, reason?:string, absolute?:boolean}} Verdict.
 */
function checkRelative(rel) {
	if (typeof rel !== "string" || !rel) return { ok: true };
	if (rel.includes("\0")) return deny("null byte in path");
	if (path.isAbsolute(rel)) return { ok: true, absolute: true };
	let depth = 0;
	for (const segment of rel.split(/[\\/]+/)) {
		if (!segment || segment === ".") continue;
		if (segment === "..") { depth -= 1; if (depth < 0) return deny("path traversal outside project root"); }
		else depth += 1;
	}
	return { ok: true };
}

function isInside(root, target) { return target === root || target.startsWith(root + path.sep); }
function deny(reason) { return { ok: false, reason }; }

module.exports = { resolveInside, checkRelative, SENSITIVE };
