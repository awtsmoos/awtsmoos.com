//B"H
//Blessed is He
//Boruch Hashem

/** @module JobLog
 * Append-only JSONL log of import job events plus the staged-upload
 * root path helper. The job log is the audit trail for bulk imports.
 */

const fs = require('fs');
const path = require('path');


function postJobLogPath($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'post-import-jobs.log');
}


function appendJobLog($i, entry) {
	try {
		fs.appendFileSync(postJobLogPath($i), JSON.stringify({ at: Date.now(), ...entry }) + '\n');
	} catch (_) { /* best effort */ }
}


function stageRoot($i) {
	const dbRoot = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dbRoot, 'socialPacked', 'bulk-stage');
}

module.exports = { postJobLogPath, appendJobLog, stageRoot };
