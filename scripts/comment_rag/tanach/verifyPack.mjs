// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file verifyPack.mjs
 * @description The Awtsmoos weighs every sealed artifact by count, dimension,
 * size, and hash before Awtsmoos.com may publish the completed light.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import {
	DIMENSIONS,
	MANIFEST_OUTPUT_PATH,
	MATRIX_PATH,
	METADATA_PATH,
	RECEIPT_PATH,
	SHARD_PATH,
	TOTAL_RECORDS
} from './config.mjs';
import { MODEL_ARTIFACTS, RAG_ARTIFACTS } from './publish/artifacts.mjs';
import { remotePath } from './publish/remotePaths.mjs';

function hashFile(file) {
	const hash = crypto.createHash('sha256');
	const handle = fs.openSync(file, 'r');
	const buffer = Buffer.allocUnsafe(1024 * 1024);
	try {
		let bytes = 0;
		while ((bytes = fs.readSync(handle, buffer, 0, buffer.length, null)) > 0) {
			hash.update(buffer.subarray(0, bytes));
		}
	} finally {
		fs.closeSync(handle);
	}
	return hash.digest('hex');
}

function countLines(file) {
	return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).length;
}

function assertManifest() {
	const manifest = JSON.parse(fs.readFileSync(MANIFEST_OUTPUT_PATH, 'utf8'));
	const expected = {
		records: TOTAL_RECORDS,
		listLength: TOTAL_RECORDS,
		dimensions: DIMENSIONS,
		directVerseRecords: 23204,
		fiveVerseWindowRecords: 23204,
		embeddingModel: 'intfloat/multilingual-e5-small'
	};
	for (const [key, value] of Object.entries(expected)) {
		if (manifest[key] !== value) throw new Error(`manifest_mismatch:${key}`);
	}
	return manifest;
}

function assertFiles() {
	const required = [
		...RAG_ARTIFACTS.filter(file => file !== RECEIPT_PATH),
		...MODEL_ARTIFACTS
	];
	for (const file of required) {
		if (!fs.statSync(file).isFile()) throw new Error(`artifact_missing:${file}`);
	}
	if (countLines(METADATA_PATH) !== TOTAL_RECORDS) throw new Error('metadata_total_mismatch');
	if (fs.statSync(MATRIX_PATH).size !== TOTAL_RECORDS * DIMENSIONS * 4) {
		throw new Error('matrix_size_mismatch');
	}
	if (fs.statSync(SHARD_PATH).size < 1024) throw new Error('shard_too_small');
	return required;
}

const required = assertFiles();
const manifest = assertManifest();
const files = required.map(file => ({
	localPath: file,
	remotePath: remotePath(file),
	bytes: fs.statSync(file).size,
	sha256: hashFile(file)
}));
const receipt = {
	BH: 'B"H',
	verifiedAt: new Date().toISOString(),
	corpusId: 'tanach-hebrew-verses',
	records: TOTAL_RECORDS,
	dimensions: DIMENSIONS,
	embeddingModel: manifest.embeddingModel,
	files
};
fs.writeFileSync(RECEIPT_PATH, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
