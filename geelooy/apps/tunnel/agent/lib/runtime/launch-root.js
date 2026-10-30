// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards the immutable launch authority while permitting safe narrowing.
 * @description
 * The Awtsmoos gives one broad vessel, yet each revealed path may enter a smaller flame;
 * Awtsmoos.com may descend within authority, but no child may widen or rename the frame.
 */
function canonical(value) {
	const text = String(value || "").trim();
	if (!text) {
		throw rootError("missing_project_root", value);
	}
	const resolved = path.resolve(text);
	try {
		return fs.realpathSync.native(resolved);
	} catch {
		return resolved;
	}
}

/** Selects the one process-wide authority chosen at launch or persisted install time. */
function select({ environment = process.env, persistedRoot, cwd = process.cwd() } = {}) {
	return canonical(
		environment.AWTSMOOS_PROJECT_ROOT ||
		environment.AWTSMOOS_INSTALL_CWD ||
		persistedRoot ||
		cwd
	);
}

/** Proves two authority claims are canonically identical. */
function assertSame(authorityRoot, candidate, field = "projectRoot") {
	const supplied = String(candidate || "").trim();
	if (!supplied) {
		return canonical(authorityRoot);
	}
	const authority = canonical(authorityRoot);
	const requested = canonical(supplied);
	if (comparisonPath(requested) !== comparisonPath(authority)) {
		throw rootError("immutable_root_violation", supplied, {
			field,
			authorityRoot: authority,
			requestedRoot: requested
		});
	}
	return authority;
}

/** Proves a requested scope is equal to or physically beneath the current authority. */
function assertInside(authorityRoot, candidate, field = "projectRoot") {
	const supplied = String(candidate || "").trim();
	const authority = canonical(authorityRoot);
	if (!supplied) {
		return authority;
	}
	const requested = canonical(supplied);
	if (!isInsideCanonical(authority, requested)) {
		throw rootError("root_scope_violation", supplied, {
			field,
			authorityRoot: authority,
			requestedRoot: requested
		});
	}
	return requested;
}

/** Answers whether one canonical path remains at or below another canonical path. */
function isInside(authorityRoot, candidate) {
	return isInsideCanonical(
		canonical(authorityRoot),
		canonical(candidate)
	);
}

function isInsideCanonical(authority, requested) {
	const relative = path.relative(
		comparisonPath(authority),
		comparisonPath(requested)
	);
	return relative === "" || (
		relative !== ".." &&
		!relative.startsWith(`..${path.sep}`) &&
		!path.isAbsolute(relative)
	);
}

function comparisonPath(value) {
	const resolved = path.resolve(value);
	return process.platform === "win32" || process.platform === "darwin"
		? resolved.toLowerCase()
		: resolved;
}

function rootError(code, value, details = {}) {
	const error = new Error(`${code}: ${String(value || "")}`);
	error.code = code;
	error.value = value;
	Object.assign(error, details);
	return error;
}

module.exports = {
	assertInside,
	assertSame,
	canonical,
	isInside,
	rootError,
	select
};
