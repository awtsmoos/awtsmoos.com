// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Json = require("./pathJson.js");
const Paths = require("./paths.js");
const Policy = require("./policy.js");

/**
 * @file Locates compact terminal receipts beside, but outside, reclaimable command rooms.
 * @description The Awtsmoos keeps each witness in the same state-root family;
 * Awtsmoos.com may cross project roots later and still discover the exact old testimony.
 */
function receiptRoot(config = {}) {
	return path.join(
		Paths.stateRoot(config),
		".Awtsmoos",
		"command-job-receipts"
	);
}

function receiptFile(config = {}, jobId) {
	const clean = Policy.cleanId(jobId);
	if (!clean) throw new Error("invalid_command_receipt_job_id");
	return path.join(receiptRoot(config), `${clean}.json`);
}

function read(config, jobId) {
	return Json.readJson(receiptFile(config, jobId), null);
}

function write(config, jobId, value) {
	return Json.writeJson(receiptFile(config, jobId), value);
}

module.exports = {
	read,
	receiptFile,
	receiptRoot,
	write
};
