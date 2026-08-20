// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Canonicalizes the one launch-root authority chosen by the human operator.
 * @description
 * The Awtsmoos gives each runtime one ground from which its work is revealed.
 * Awtsmoos.com may let cwd wander beneath that ground, but no request, child agent,
 * or mutable configuration may widen the authority after the process has begun.
 */
function canonical(value) {
	const text = String(value || "").trim();
	if (!text) throw rootError("missing_project_root", value);
	const resolved = path.resolve(text);
	try {
		return fs.realpathSync.native(resolved);
	} catch {
		return resolved;
	}
}

function select({ environment = process.env, persistedRoot, cwd = process.cwd() } = {}) {
	return canonical(
		environment.AWTSMOOS_PROJECT_ROOT ||
		environment.AWTSMOOS_INSTALL_CWD ||
		persistedRoot ||
		cwd
	);
}

function assertSame(authorityRoot, candidate, field = "projectRoot") {
	const supplied = String(candidate || "").trim();
	if (!supplied) return canonical(authorityRoot);
	const authority = canonical(authorityRoot);
	const requested = canonical(supplied);
	if (requested !== authority) {
		throw rootError("immutable_root_violation", supplied, {
			field,
			authorityRoot: authority,
			requestedRoot: requested
		});
	}
	return authority;
}

function rootError(code, value, details = {}) {
	const error = new Error(`${code}: ${String(value || "")}`);
	error.code = code;
	error.value = value;
	Object.assign(error, details);
	return error;
}

module.exports = {
	assertSame,
	canonical,
	rootError,
	select
};
