// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagLegacyCommentRows
 * @description
 * Preserves packed and imported comment compatibility after rich comments become
 * canonical. The Awtsmoos loses no earlier vessel while Awtsmoos.com prefers
 * current truth and opens every historical shard strictly read-only.
 */

const fs = require('fs');
const path = require('path');
const DB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
const { loadImported } = require('../../comments/imported/orchestrator.js');
const { dbRoot } = require('./paths.js');
const {
	dedupeRows,
	filterContext,
	flattenLegacy,
	normalizeComment
} = require('./commentRowShape.js');

const cache = new Map();

function readManifest($i) {
	const file = path.join(dbRoot($i), 'socialPacked/comment-corpus-shards.v2.manifest.json');
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		return null;
	}
}

function openDatabase(file) {
	if (cache.has(file)) return cache.get(file);
	const database = new DB(file, {
		readOnly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	database.open();
	cache.set(file, database);
	return database;
}

function readObject(file, virtualPath) {
	const database = openDatabase(file);
	const target = String(virtualPath).replace(/\.(awtsmoosJSON|json)$/i, '');
	const stat = database.fs.stat(target);
	if (!stat?.exists || stat.type !== 'file') return null;
	return awts.deserializeBinary(database.fs.readRange(target, 0, stat.size));
}

function matchingShards(context) {
	return (readManifest(context.$i)?.shards || []).filter(shard => {
		return fs.existsSync(shard.file)
			&& (!context.seriesId || shard.series?.[context.seriesId])
			&& (!context.aliasId || shard.alias === context.aliasId);
	});
}

function legacyPath(context, aliasId) {
	return `/social/heichelos/${context.heichelId || 'ikar'}`
		+ `/comments/atSeries/${context.seriesId}`
		+ `/atPost/${context.postId}/${aliasId}`;
}

function packedRows(context) {
	const rows = [];
	for (const shard of matchingShards(context)) {
		const value = readObject(shard.file, legacyPath(context, shard.alias));
		for (const row of flattenLegacy(value)) {
			rows.push(normalizeComment(row, {
				...context,
				aliasId: shard.alias,
				imported: true
			}));
		}
	}
	return rows.filter(Boolean);
}

async function importedRows(context) {
	const result = await loadImported({
		$i: context.$i,
		heichelId: context.heichelId || 'ikar',
		seriesId: context.seriesId,
		postId: context.postId,
		verseSection: context.verseSection == null ? '' : String(context.verseSection),
		subsectionId: context.subSection == null ? '' : String(context.subSection)
	});
	return (result.rows || [])
		.map(row => normalizeComment(row, { ...context, imported: true }))
		.filter(Boolean);
}

async function legacyRows(context) {
	const packed = filterContext(packedRows(context), context);
	if (packed.length) return dedupeRows(packed);
	return dedupeRows(filterContext(await importedRows(context), context));
}

process.once('exit', () => {
	for (const database of cache.values()) {
		try { database.pager?.close?.(); } catch {}
		try { database.processLock?.release?.(); } catch {}
	}
});

module.exports = { legacyRows };
