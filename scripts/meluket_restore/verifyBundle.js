// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyBundle.js
 * @description
 * The Awtsmoos rereads every restored branch in one bounded passage. Rich
 * records, keyed indexes, section children, dual series projections, comment
 * bridges, and every packed identity must all stand before production opens.
 */

const fs = require("fs");
const path = require("path");
const DosDB = require("../../ayzarim/DosDB/index.js");
const {
	listPackedRecords
} = require("../../geelooy/api/social/helper/packed/socialPacked.js");
const {
	bundleRoot
} = require("./constants.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

async function verifyRecord(db, record, historicalSeriesId) {
	const richPath = `/social/heichelos/ikar/posts/${record.id}.awtsmoosJSON`;
	const rich = await db.get(richPath);
	if (!rich || rich.title !== record.title) return `rich:${record.id}`;
	if ((rich.sections || []).length !== record.sections.length) {
		return `sections:${record.id}`;
	}
	const postIndex = await db.getObjectKey(
		"/social/heichelos/ikar/postIds",
		record.id
	);
	if (!postIndex) return `postIndex:${record.id}`;
	const aliasBase = "/social/aliases/theRebbe/postsSubmitted/inHeichel/ikar/inSeries";
	const friendlyIndex = await db.getObjectKey(
		`${aliasBase}/${record.seriesId}`,
		record.id
	);
	if (!friendlyIndex) return `friendlyAlias:${record.id}`;
	const historicalIndex = await db.getObjectKey(
		`${aliasBase}/${historicalSeriesId}`,
		record.id
	);
	if (!historicalIndex) return `historyAlias:${record.id}`;
	const firstSection = record.sections[0];
	const sectionPath = `${richPath.slice(0, -".awtsmoosJSON".length)}/sections/${firstSection.id}`;
	if (!await db.get(sectionPath)) return `sectionChild:${record.id}`;
	return null;
}

function packedPostIds(db) {
	const records = listPackedRecords({ $i: { db }, shard: "core" });
	return new Set(records
		.filter(item => item.meta?.kind === "post")
		.map(item => item.value?.id || item.value?.postId)
		.filter(Boolean));
}

async function verifySeries(db, mappings, failures) {
	for (const month of new Set(mappings.map(row => row.month))) {
		const rows = mappings.filter(row => row.month === month);
		for (const key of ["friendlySeriesId", "historicalSeriesId"]) {
			const seriesId = rows[0][key];
			const objectPath = `/social/heichelos/ikar/series/${seriesId}/posts`;
			const ids = await db.getObjectKeys(objectPath);
			const expected = new Set(rows.map(row => row.newPostId));
			if (ids.length !== rows.length) failures.push(`${key}:${month}:count`);
			for (const id of expected) {
				if (!ids.includes(id)) {
					failures.push(`${key}:${month}:missing:${id}`);
					continue;
				}
				const value = await db.getObjectKey(objectPath, id);
				if (!value || (value.id || value.postId) !== id) {
					failures.push(`${key}:${month}:value:${id}`);
				}
			}
		}
	}
}

async function main() {
	const rootIndex = process.argv.indexOf("--db-root");
	const dbRoot = path.resolve(rootIndex >= 0
		? process.argv[rootIndex + 1]
		: path.join(bundleRoot, "dry-run-db"));
	const records = readJson("records.json");
	const mappings = readJson("mappings.json");
	const manifest = readJson("manifest.json");
	const mappingById = new Map(mappings.map(row => [row.newPostId, row]));
	const db = new DosDB(dbRoot);
	await db.init();
	const failures = [];
	for (const record of records) {
		const mapping = mappingById.get(record.id);
		const failure = await verifyRecord(db, record, mapping.historicalSeriesId);
		if (failure) failures.push(failure);
	}
	await verifySeries(db, mappings, failures);
	const contribution = await db.getObjectKey(
		"/social/aliases/theRebbe/heichelosContributedTo",
		"ikar"
	);
	if (!contribution) failures.push("heichelContribution");
	const mapPath = path.join(dbRoot, "socialPacked", "meluket-post-map.v1.json");
	const commentMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
	if (commentMap.count !== 436) failures.push("commentMap");
	const packedIds = packedPostIds(db);
	for (const record of records) {
		if (!packedIds.has(record.id)) failures.push(`packed:${record.id}`);
	}
	const report = {
		dbRoot,
		postCount: records.length,
		packedPostCount: records.filter(record => packedIds.has(record.id)).length,
		failureCount: failures.length,
		failures: failures.slice(0, 200),
		recordHash: manifest.recordHash,
		verifiedAt: new Date().toISOString()
	};
	fs.writeFileSync(
		path.join(bundleRoot, "verify-report.json"),
		JSON.stringify(report, null, 2)
	);
	console.log(JSON.stringify(report, null, 2));
	if (failures.length) process.exitCode = 1;
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
