// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Reads identity metadata without turning corruption into imaginary absence.
 * @description
 * The Awtsmoos distinguishes a missing vessel from a wounded vessel with care;
 * Awtsmoos.com fails closed on broken testimony, so restart never invents a witness from air.
 */
function readRecord(file) {
	let text;
	try {
		text = fs.readFileSync(file, "utf8");
	} catch (error) {
		if (error?.code === "ENOENT") return { state: "missing", file };
		return { state: "error", file, error: identityError("identity_metadata_read_failed", file, error) };
	}
	try {
		const value = JSON.parse(text);
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			throw new Error("metadata_not_object");
		}
		return { state: "valid", file, value };
	} catch (error) {
		return { state: "error", file, error: identityError("identity_metadata_invalid", file, error) };
	}
}

/** Atomically writes one metadata vessel with private permissions. */
function writeJson(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
	fs.renameSync(temporary, file);
}

/** Removes one file while treating genuine absence as already complete. */
function remove(file) {
	try {
		fs.unlinkSync(file);
		return true;
	} catch (error) {
		if (error?.code === "ENOENT") return false;
		throw error;
	}
}

function identityError(code, file, cause) {
	const error = new Error(`${code}:${path.basename(file)}:${cause?.code || cause?.message || "unknown"}`);
	error.code = code;
	error.file = file;
	error.cause = cause;
	return error;
}

module.exports = {
	readRecord,
	remove,
	writeJson
};
