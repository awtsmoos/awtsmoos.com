// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file backfillPostsByAliasJournal.js
 * @description
 * The Awtsmoos streams a vast historical search sea through a tiny bounded vessel;
 * Awtsmoos.com builds derived alias buckets beside production, proving the source stayed unchanged before activation.
 */

const fs = require('node:fs');
const path = require('node:path');
const { fileFor } = require('../socialPackedEngine.js');
const { forEachLineFastAsync } = require('../socialPackedLineFast.js');
const {
	JOURNAL_VERSION,
	bucketFileForDirectory,
	journalDirectory,
	manifestFileForDirectory
} = require('../postsByAliasJournalPath.js');
const { locatorFromSearchRecord, serializeLocator } = require('../postsByAliasJournalRecord.js');

function evidence(file) {
	const stat = fs.statSync(file, { bigint: true });
	return {
		dev: String(stat.dev),
		ino: String(stat.ino),
		size: String(stat.size),
		mtimeNs: String(stat.mtimeNs)
	};
}

function sameEvidence(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}

async function buildJournal(dbRoot, stageOverride) {
	const $i = { db: { directory: dbRoot } };
	const source = fileFor(dbRoot, 'search');
	const active = journalDirectory($i);
	if (!source || !fs.existsSync(source)) throw new Error('SEARCH_SOURCE_MISSING');
	if (fs.existsSync(active)) throw new Error('ACTIVE_JOURNAL_ALREADY_EXISTS');
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const stage = stageOverride || `${active}.staging-${stamp}-${process.pid}`;
	if (fs.existsSync(stage)) throw new Error('STAGE_ALREADY_EXISTS');
	fs.mkdirSync(stage, { recursive: true });
	const before = evidence(source);
	const handles = new Map();
	const metrics = { scannedLines: 0, matchedHeads: 0, records: 0, malformed: 0, journalBytes: 0 };
	try {
		await forEachLineFastAsync(dbRoot, 'search', (head, getFull) => {
			metrics.scannedLines += 1;
			if (!head.includes('"key":"/indexes/postsByAlias/')) return true;
			metrics.matchedHeads += 1;
			let record;
			try { record = JSON.parse(getFull()); } catch (_error) { metrics.malformed += 1; return true; }
			const locator = locatorFromSearchRecord(record);
			if (!locator) return true;
			const file = bucketFileForDirectory(stage, locator.a);
			let descriptor = handles.get(file);
			if (descriptor === undefined) {
				descriptor = fs.openSync(file, 'a');
				handles.set(file, descriptor);
			}
			const line = serializeLocator(locator);
			fs.writeSync(descriptor, line);
			metrics.records += 1;
			metrics.journalBytes += Buffer.byteLength(line);
			return true;
		});
	} finally {
		for (const descriptor of handles.values()) {
			try { fs.closeSync(descriptor); } catch (_error) {}
		}
	}
	const after = evidence(source);
	const manifest = {
		version: JOURNAL_VERSION,
		active: false,
		stable: sameEvidence(before, after),
		source,
		sourceBefore: before,
		sourceAfter: after,
		...metrics,
		bucketCount: handles.size,
		createdAt: new Date().toISOString()
	};
	const manifestFile = manifestFileForDirectory(stage);
	const temporary = `${manifestFile}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, JSON.stringify(manifest, null, 2) + '\n');
	fs.renameSync(temporary, manifestFile);
	return { stage, active, manifest };
}

if (require.main === module) {
	buildJournal(process.argv[2], process.argv[3])
		.then(result => {
			console.log(JSON.stringify(result, null, 2));
			if (!result.manifest.stable) process.exitCode = 2;
		})
		.catch(error => { console.error(error.stack || error); process.exitCode = 1; });
}

module.exports = { buildJournal, evidence, sameEvidence };
