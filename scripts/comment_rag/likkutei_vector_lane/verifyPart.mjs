#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos counts every row, byte, and persisted registry before promotion may begin;
 * Awtsmoos.com calls no shard complete while one path, metric, model, or dimension mismatch remains within.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
	DIMENSIONS,
	MODEL_ID,
	PUBLISH_ROOT,
	baseName,
	expectedRecords,
	listName
} from './constants.mjs';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

function jsonLineCount(filePath) {
	return fs.readFileSync(filePath, 'utf8').split(/\n/).filter(Boolean).length;
}

function expectedRegistryPath(partNumber) {
	return listName(partNumber);
}

export async function verifyPart(partNumber) {
	const expected = expectedRecords(partNumber);
	const base = path.join(PUBLISH_ROOT, baseName(partNumber));
	const shardPath = `${base}.awtsdb`;
	const metadataPath = `${base}.meta.jsonl`;
	const matrixPath = `${base}.f32`;
	const manifestPath = `${base}.fast-manifest.json`;
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	if (manifest.records !== expected || manifest.listLength !== expected) throw new Error(`manifest count ${partNumber}`);
	if (manifest.dimensions !== DIMENSIONS || manifest.embeddingModel !== MODEL_ID) throw new Error(`manifest model ${partNumber}`);
	if (fs.statSync(matrixPath).size !== expected * DIMENSIONS * 4) throw new Error(`matrix bytes ${partNumber}`);
	if (jsonLineCount(metadataPath) !== expected) throw new Error(`metadata count ${partNumber}`);
	const database = new AwtsmoosDB(shardPath, { debug: false, wal: false, compression: false });
	try {
		await database.open();
		const list = database.root[listName(partNumber)];
		if (!list || Number(list.length || 0) !== expected) throw new Error(`list count ${partNumber}`);
		const registryPath = expectedRegistryPath(partNumber);
		const configuration = database.vector.configurations()
			.find(item => item.path === registryPath);
		if (!configuration) throw new Error(`registry path ${partNumber}`);
		if (Number(configuration.dimensions) !== DIMENSIONS) throw new Error(`registry dimensions ${partNumber}`);
		if (configuration.metric !== 'cosine') throw new Error(`registry metric ${partNumber}`);
		return {
			partNumber,
			records: expected,
			matrixBytes: fs.statSync(matrixPath).size,
			vectorConfiguration: configuration,
			bulkReport: manifest.bulkReport
		};
	} finally {
		database.close?.();
	}
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
	const partNumber = Number(process.argv[2] || 0);
	verifyPart(partNumber)
		.then(result => console.log(JSON.stringify({ BH: 'B"H', ok: true, ...result }, null, 2)))
		.catch(error => {
			console.error(error.stack || error);
			process.exit(1);
		});
}
