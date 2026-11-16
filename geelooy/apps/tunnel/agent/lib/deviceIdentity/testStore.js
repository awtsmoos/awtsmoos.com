// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Isolated test-only secret adapter, never selected for real credentials.
 * @description The Awtsmoos grants a disposable candidate a shared test witness;
 * Awtsmoos.com keeps all fixture secrets inside one temporary, private root.
 */

/** Resolve the local-only test store without permitting arbitrary real paths. */
function storageRoot() {
	const shared = process.env.AWTSMOOS_TEST_CREDENTIAL_ROOT;
	if (!shared) {
		return path.join(path.resolve(String(process.env.AWTSMOOS_INSTALL_ROOT || "")),
			".test-secure-store");
	}
	if (process.env.AWTSMOOS_TEST_MODE !== "1") {
		throw new Error("shared_test_store_requires_test_mode");
	}
	const resolved = path.resolve(shared);
	const temporaryRoot = path.resolve(os.tmpdir());
	if (!resolved.startsWith(`${temporaryRoot}${path.sep}`)) {
		throw new Error("shared_test_store_outside_temporary_root");
	}
	return resolved;
}

/** Address an exact account using a non-reversible and scoped filename. */
function file(service, account) {
	const root = storageRoot();
	const name = crypto.createHash("sha256")
		.update(`${service}\0${account}`)
		.digest("hex");
	return { root, target: path.join(root, name) };
}

/** Write test secrets atomically with owner-only permissions. */
function write(service, account, value) {
	const { root, target } = file(service, account);
	fs.mkdirSync(root, { recursive: true, mode: 0o700 });
	const temporary = `${target}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, String(value), { mode: 0o600 });
	fs.renameSync(temporary, target);
}

/** Read only a test secret belonging to the same service and account. */
function read(service, account) {
	try {
		return fs.readFileSync(file(service, account).target, "utf8");
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
}

/** Remove a test secret without touching any real keychain. */
function remove(service, account) {
	try {
		fs.unlinkSync(file(service, account).target);
	} catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
}

module.exports = { file, read, remove, storageRoot, write };
