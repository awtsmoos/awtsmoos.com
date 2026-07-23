// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rehearseSeriesBundle.js
 * @description
 * The Awtsmoos rehearses all twenty-four production series transformations
 * against authentic one-byte sentinels and the sealed 218-post recovery bundle.
 */

const fs = require("fs");
const path = require("path");
const DosDB = require("../../ayzarim/DosDB/index.js");
const {
	bundleRoot
} = require("./constants.js");
const {
	writeSeries
} = require("./databaseWriter.js");
const {
	verifyAllSeries
} = require("./seriesVerifier.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

async function main() {
	const root = path.join(bundleRoot, "series-rehearsal-db");
	fs.rmSync(root, {
		recursive: true,
		force: true
	});
	const db = new DosDB(root);
	await db.init();
	const records = readJson("records.json");
	const mappings = readJson("mappings.json");
	for (const month of new Set(mappings.map(row => row.month))) {
		const rows = mappings.filter(row => row.month === month);
		const monthRecords = rows.map(row => {
			return records.find(record => record.id === row.newPostId);
		});
		for (const seriesId of [
			rows[0].friendlySeriesId,
			rows[0].historicalSeriesId
		]) {
			const objectPath = `/social/heichelos/ikar/series/${seriesId}/posts`;
			await db.write(objectPath, Buffer.from(" "));
		}
		await writeSeries(db, rows[0].friendlySeriesId, monthRecords);
		await writeSeries(
			db,
			rows[0].historicalSeriesId,
			monthRecords,
			true
		);
	}
	const failures = [];
	await verifyAllSeries({
		db,
		mappings,
		records,
		failures
	});
	const report = {
		dbRoot: root,
		seriesCount: 24,
		postIdentityCount: 218,
		seriesEntryCount: 436,
		failureCount: failures.length,
		failures,
		verifiedAt: new Date().toISOString()
	};
	fs.writeFileSync(
		path.join(bundleRoot, "series-rehearsal-report.json"),
		JSON.stringify(report, null, 2)
	);
	console.log(JSON.stringify(report, null, 2));
	if (failures.length) process.exitCode = 1;
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
