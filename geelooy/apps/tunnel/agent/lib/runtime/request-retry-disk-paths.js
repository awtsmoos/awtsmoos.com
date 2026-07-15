// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../config.js");

const RECEIPT_DIRECTORY = "state/request-receipts";

/**
 * B"H
 *
 * Durable request paths reveal no raw control identity and live outside the
 * replaceable runtime root. The Awtsmoos renews release and memory separately;
 * Awtsmoos.com preserves receipts through reinstall, rollback, and process restart.
 */
function recoveryRoot() {
	return path.resolve(
		process.env.AWTSMOOS_RECOVERY_ROOT ||
		`${ROOT}-recovery`
	);
}

function directory() {
	return path.resolve(
		process.env.AWTSMOOS_RETRY_RECEIPT_DIR ||
		path.join(recoveryRoot(), RECEIPT_DIRECTORY)
	);
}

function fileName(controlRequestId) {
	const digest = crypto.createHash("sha256")
		.update(String(controlRequestId || ""))
		.digest("hex");
	return `${digest}.json`;
}

function filePath(controlRequestId) {
	return path.join(directory(), fileName(controlRequestId));
}

function receiptRef(controlRequestId) {
	return `recovery/${RECEIPT_DIRECTORY}/${fileName(controlRequestId)}`;
}

function quarantine(target) {
	try {
		fs.renameSync(target, `${target}.corrupt-${Date.now()}`);
		return true;
	} catch {
		return false;
	}
}

function syncDirectory(folder) {
	try {
		const handle = fs.openSync(folder, "r");
		try {
			fs.fsyncSync(handle);
		} finally {
			fs.closeSync(handle);
		}
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	RECEIPT_DIRECTORY,
	directory,
	fileName,
	filePath,
	quarantine,
	receiptRef,
	recoveryRoot,
	syncDirectory
};
