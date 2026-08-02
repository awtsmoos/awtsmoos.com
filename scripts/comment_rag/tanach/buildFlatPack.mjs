// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file buildFlatPack.mjs
 * @description The Awtsmoos pours every normalized verse into one atomic matrix of light;
 * Awtsmoos.com seals metadata, manifest, marker, and summary together and right.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {
	DIMENSIONS,
	MANIFEST_OUTPUT_PATH,
	MATRIX_PATH,
	METADATA_PATH,
	MODEL_ID,
	SHARD_PATH,
	TOTAL_RECORDS,
	VECTORS_PATH
} from './config.mjs';

const SUMMARY_PATH = MANIFEST_OUTPUT_PATH.replace('.fast-manifest.json', '.pack-summary.json');
const stages = new Map([
	[METADATA_PATH, `${METADATA_PATH}.tmp`],
	[MATRIX_PATH, `${MATRIX_PATH}.tmp`],
	[MANIFEST_OUTPUT_PATH, `${MANIFEST_OUTPUT_PATH}.tmp`],
	[SUMMARY_PATH, `${SUMMARY_PATH}.tmp`],
	[SHARD_PATH, `${SHARD_PATH}.tmp`]
]);

function metadataRow(row) {
	const { vec, embedding, vector, ...metadata } = row;
	return {
		...metadata,
		vectorDimensions: DIMENSIONS,
		contextPolicy: 'dynamic neighboring verses within chapter'
	};
}

function writeJson(pathname, value) {
	fs.writeFileSync(pathname, `${JSON.stringify(value, null, 2)}\n`);
}

for (const stage of stages.values()) fs.rmSync(stage, { force: true });
const metadata = fs.createWriteStream(stages.get(METADATA_PATH));
const matrix = fs.openSync(stages.get(MATRIX_PATH), 'w');
const input = readline.createInterface({
	input: fs.createReadStream(VECTORS_PATH),
	crlfDelay: Infinity
});
let records = 0;
try {
	for await (const line of input) {
		if (!line.trim()) continue;
		const row = JSON.parse(line);
		if (row.kind !== 'verse' || row.realEmbedding !== true) {
			throw new Error(`invalid_flat_record:${row.id}`);
		}
		if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) {
			throw new Error(`invalid_flat_vector:${row.id}`);
		}
		metadata.write(`${JSON.stringify(metadataRow(row))}\n`);
		const values = new Float32Array(row.vec);
		fs.writeSync(matrix, Buffer.from(values.buffer));
		records += 1;
	}
} finally {
	fs.closeSync(matrix);
	await new Promise((resolve, reject) => {
		metadata.end(resolve);
		metadata.on('error', reject);
	});
}
if (records !== TOTAL_RECORDS) throw new Error(`flat_record_total_mismatch:${records}`);
const manifest = {
	BH: 'B"H',
	id: 'tanach-hebrew-verses',
	title: 'Tanach Hebrew Verses',
	aliases: ['tanach', 'tanach-hebrew'],
	corpusId: 'tanach-hebrew-verses',
	listName: 'tanachHebrewVerseVectors',
	records,
	listLength: records,
	dimensions: DIMENSIONS,
	embeddingModel: MODEL_ID,
	indexType: 'flat-f32',
	matrixFile: path.basename(MATRIX_PATH),
	metadataSidecar: path.basename(METADATA_PATH),
	directVerseRecords: records,
	fiveVerseWindowRecords: 0,
	contextPolicy: 'dynamic neighboring verses within chapter'
};
writeJson(stages.get(MANIFEST_OUTPUT_PATH), manifest);
writeJson(stages.get(SUMMARY_PATH), {
	...manifest,
	matrixBytes: records * DIMENSIONS * Float32Array.BYTES_PER_ELEMENT,
	builtAt: new Date().toISOString()
});
const marker = `${JSON.stringify({ ...manifest, marker: 'flat-f32-sidecar-index' }, null, 2)}\n`;
fs.writeFileSync(stages.get(SHARD_PATH), marker.padEnd(2048, ' '));
for (const [target, stage] of stages) fs.renameSync(stage, target);
console.log(JSON.stringify(manifest, null, 2));
