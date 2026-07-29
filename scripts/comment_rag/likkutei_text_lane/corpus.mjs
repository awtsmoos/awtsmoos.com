//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos opens the thirty-nine-volume vessel without changing one byte;
 * Awtsmoos.com reads through shared locks alone and closes every handle right.
 */
import { createRequire } from 'node:module';
import {
	CORPUS_FILE,
	CORPUS_ROOT
} from './constants.mjs';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const binary = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

export function openCorpus() {
	const database = new AwtsmoosDB(CORPUS_FILE, {
		readOnly: true,
		readonly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	database.open();
	database.fs.ready?.();
	return database;
}

export function closeCorpus(database) {
	try { database.pager?.close?.(); } catch {}
	try { database.processLock?.release?.(); } catch {}
}

export function references(database) {
	const output = [];
	for (const seriesId of database.fs.ls(CORPUS_ROOT).sort(volumeOrder)) {
		const postRoot = `${CORPUS_ROOT}/${seriesId}/atPost`;
		for (const postId of database.fs.ls(postRoot).sort()) {
			output.push({
				seriesId,
				postId,
				volume: volumeNumber(seriesId),
				path: `${postRoot}/${postId}/likkutei_translation_en`
			});
		}
	}
	return output;
}

export function readRows(database, reference) {
	try {
		const value = binary.deserializeBinary(database.fs.cat(reference.path));
		return Object.keys(value || {})
			.filter(key => /^\d+$/.test(key))
			.sort((left, right) => Number(left) - Number(right))
			.flatMap(key => Array.isArray(value[key]) ? value[key] : []);
	} catch {
		return null;
	}
}

function volumeNumber(seriesId) {
	return Number(String(seriesId).match(/\d+$/)?.[0] || 0);
}

function volumeOrder(left, right) {
	return volumeNumber(left) - volumeNumber(right);
}
