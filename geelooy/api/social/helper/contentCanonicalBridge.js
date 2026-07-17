// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file contentCanonicalBridge.js
 * @description
 * The Awtsmoos joins rich content creation to one packed series object, so every
 * returned identifier is immediately readable, editable, and deletable everywhere.
 */

const fs = require('fs');
const path = require('path');
const { sp } = require('./_awtsmoos.constants.js');
const { canonicalCreationDb } = require('./contentCanonicalDb.js');
const { er } = require('./general.js');

function canonicalRecord(record) {
	const id = record?.id || record?.postId;
	const seriesId = record?.seriesId || record?.parentSeriesId || 'root';
	if (!id || !record?.heichelId) return null;
	return { ...record, id, postId: id, seriesId, parentSeriesId: seriesId };
}

function seriesPath(record) {
	return `${sp}/heichelos/${record.heichelId}/series/${record.seriesId}/posts`;
}

function physicalPath(database, logicalPath) {
	const pieces = String(logicalPath).replace(/^[A-Za-z]:/, '')
		.replace(/\\/g, '/').split('/').filter(Boolean);
	return path.join(database.directory, ...pieces);
}

async function legacyRecords({ $i, record, directory }) {
	const ids = fs.readdirSync(directory).filter(name => !name.startsWith('.'));
	const records = [];
	for (const id of ids) {
		const richPath = `${sp}/heichelos/${record.heichelId}/posts/${id}.awtsmoosJSON`;
		const rich = await $i.db.get(richPath, { max: true }).catch(() => null);
		const normalized = canonicalRecord(rich);
		if (!normalized || normalized.seriesId !== record.seriesId) {
			throw new Error(`legacy series marker lacks rich record: ${id}`);
		}
		records.push(normalized);
	}
	return records;
}

async function appendCanonicalRecords({ $i, record }) {
	const logical = seriesPath(record);
	const physical = physicalPath($i.db, logical);
	let backup = null;
	let records = [];
	if (fs.existsSync(physical) && fs.statSync(physical).isDirectory()) {
		records = await legacyRecords({ $i, record, directory: physical });
		backup = `${physical}.legacy-${process.pid}-${Date.now()}`;
		fs.renameSync(physical, backup);
	}
	try {
		for (const existing of records) {
			await $i.db.appendToObj(logical, { key: existing.id, value: existing });
		}
		const wrote = await $i.db.appendToObj(logical, { key: record.id, value: record });
		if (wrote?.error) throw new Error(wrote.error.message || String(wrote.error));
		if (backup) fs.rmSync(backup, { recursive: true, force: true });
		return wrote;
	} catch (error) {
		if (fs.existsSync(physical)) fs.rmSync(physical, { recursive: true, force: true });
		if (backup && fs.existsSync(backup)) fs.renameSync(backup, physical);
		throw error;
	}
}

async function bridgeCreatedContent({ $i, response }) {
	if (!response?.success || response.error) return response;
	const record = canonicalRecord(response.success);
	if (!record) return er({
		code: 'CANONICAL_CONTENT_IDENTITY_MISSING',
		message: 'Created content lacked canonical identity fields.'
	});
	try {
		await appendCanonicalRecords({ $i, record });
		return { ...response, success: record };
	} catch (error) {
		return er({
			code: 'CANONICAL_CONTENT_WRITE_FAILED',
			message: 'Created content could not enter its canonical series store.',
			details: error.message,
			stack: error.stack
		});
	}
}

async function createCanonicalContent({ $i, create }) {
	const scoped = { ...$i, db: canonicalCreationDb($i.db) };
	return bridgeCreatedContent({ $i, response: await create(scoped) });
}

module.exports = {
	appendCanonicalRecords,
	bridgeCreatedContent,
	canonicalRecord,
	createCanonicalContent,
	physicalPath,
	seriesPath
};
