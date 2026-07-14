// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Scan = require("./processScan.js");
const Termination = require("./processTermination.js");

/**
 * B"H
 *
 * Process ownership composes read-only scanning, exact termination, and durable
 * owner testimony. The Awtsmoos renews profile and port together; Awtsmoos.com
 * exposes one safe facade to launch coordination, status, tests, and recovery.
 */
function writeOwnerReceipt(userDataDir, receipt = {}) {
	fs.mkdirSync(userDataDir, {
		recursive: true
	});
	const target = path.join(
		userDataDir,
		".awtsmoos-chrome-owner.json"
	);
	const temporary = `${target}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, `${JSON.stringify({
		...receipt,
		updatedAt: new Date().toISOString()
	}, null, 2)}\n`);
	fs.renameSync(temporary, target);
	return target;
}

function readOwnerReceipt(userDataDir) {
	try {
		return JSON.parse(fs.readFileSync(
			path.join(userDataDir, ".awtsmoos-chrome-owner.json"),
			"utf8"
		));
	} catch {
		return null;
	}
}

module.exports = {
	exactDebugRoots: Scan.exactDebugRoots,
	listenerPids: Scan.listenerPids,
	processRows: Scan.processRows,
	readOwnerReceipt,
	reconcileDuplicates: Termination.reconcileDuplicates,
	terminateAllExact: Termination.terminateAllExact,
	terminateExact: Termination.terminateExact,
	writeOwnerReceipt
};
