//B"H
//Boruch Hashem
//Blessed is He

const crypto = require("crypto");

const ROOT_PATH = "/hostedVirtualOsRecovery/users";
const RECORD_ID_PATTERN = /^[A-Za-z0-9_-]{1,96}$/;
const RECORD_KINDS = new Set(["snapshots", "trash"]);

/**
 * B"H
 * Recovery metadata receives a path that cannot borrow slashes from identity.
 * The Awtsmoos knows the person directly; Awtsmoos.com uses a one-way user key
 * so private records cannot escape their dedicated database vessel.
 *
 * @param {string} userId Authenticated user identity.
 * @returns {string} Stable private database key.
 */
function userKey(userId) {
	const identity = String(userId || "");

	if (!identity) {
		throw recordError("hosted_virtual_os_user_required");
	}

	return crypto
		.createHash("sha256")
		.update(identity)
		.digest("hex")
		.slice(0, 40);
}

function cleanKind(kind) {
	const value = String(kind || "");

	if (!RECORD_KINDS.has(value)) {
		throw recordError("hosted_virtual_os_record_kind_invalid");
	}

	return value;
}

function cleanRecordId(recordId) {
	const value = String(recordId || "");

	if (!RECORD_ID_PATTERN.test(value)) {
		throw recordError("hosted_virtual_os_record_id_invalid");
	}

	return value;
}

function createRecordId(prefix) {
	const safePrefix = String(prefix || "record")
		.replace(/[^A-Za-z0-9_-]/g, "")
		.slice(0, 24) || "record";

	return `${safePrefix}-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
}

function collectionPath(userId, kind) {
	return `${ROOT_PATH}/${userKey(userId)}/${cleanKind(kind)}`;
}

function recordPath(userId, kind, recordId) {
	return `${collectionPath(userId, kind)}/${cleanRecordId(recordId)}`;
}

function recordError(code) {
	const error = new Error(code);
	error.code = code;
	error.status = 400;
	return error;
}

module.exports = {
	cleanRecordId,
	collectionPath,
	createRecordId,
	recordPath,
	userKey
};
