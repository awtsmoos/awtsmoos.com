// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

const POLICY_CODES = new Set([
	"path_contains_null_byte",
	"path_outside_project_root",
	"secret_path_blocked",
	"symlink_outside_project_root"
]);

/**
 * @file Projects filesystem failures into a small safe covenant that survives process boundaries.
 * @description
 * The Awtsmoos reveals each failure without revealing forbidden territory; Awtsmoos.com
 * names the operation, safe path, and stable kind while preserving the original error code.
 * Policy fences remain policy fences, and operating-system failures remain honest witnesses.
 */
function classify(code) {
	const value = String(code || "FS_ERROR");
	if (POLICY_CODES.has(value)) return "policy";
	if (["EACCES", "EPERM"].includes(value)) return "permission";
	if (["ENOENT", "ENXIO"].includes(value)) return "missing";
	if (["EISDIR", "ENOTDIR", "EINVAL"].includes(value)) return "type";
	if (["ELOOP"].includes(value)) return "symlink";
	if (["EMFILE", "ENFILE", "ENOSPC"].includes(value)) return "capacity";
	return "io";
}

function safeLabel(config, targetPath) {
	const root = path.resolve(String(config?.root || process.cwd()));
	const raw = String(targetPath ?? ".").replace(/[\u0000-\u001f]/g, "");
	if (!path.isAbsolute(raw)) return normalize(raw || ".");
	const resolved = path.resolve(raw);
	const relative = path.relative(root, resolved);
	if (relative === "") return ".";
	if (relative.startsWith("..") || path.isAbsolute(relative)) {
		return "[outside-project-root]";
	}
	return normalize(relative);
}

function normalize(value) {
	return String(value || ".")
		.replace(/\\/g, "/")
		.slice(0, 1000);
}

function project(config, errorOrCode, operation, targetPath) {
	const code = typeof errorOrCode === "string"
		? errorOrCode
		: String(errorOrCode?.code || "FS_ERROR");
	const kind = classify(code);
	return sanitize({
		code,
		kind,
		operation: String(operation || "filesystem").slice(0, 120),
		path: safeLabel(config, targetPath),
		policy: kind === "policy",
		retryable: ["capacity", "io"].includes(kind)
	});
}

function decorate(config, error, operation, targetPath) {
	const vessel = error instanceof Error
		? error
		: new Error(String(error || "filesystem_error"));
	vessel.code ||= "FS_ERROR";
	vessel.filesystem = project(config, vessel, operation, targetPath);
	return vessel;
}

function sanitize(value) {
	if (!value || typeof value !== "object") return null;
	return {
		code: String(value.code || "FS_ERROR").slice(0, 120),
		kind: String(value.kind || "io").slice(0, 80),
		operation: String(value.operation || "filesystem").slice(0, 120),
		path: normalize(value.path || "."),
		policy: value.policy === true,
		retryable: value.retryable === true
	};
}

function transport(error) {
	return sanitize(error?.filesystem);
}

function restore(error, filesystem) {
	const projected = sanitize(filesystem);
	if (projected) {
		error.filesystem = projected;
	}
	return error;
}

module.exports = {
	classify,
	decorate,
	project,
	restore,
	safeLabel,
	sanitize,
	transport
};
