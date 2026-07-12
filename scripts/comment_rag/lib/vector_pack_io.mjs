// B"H

/**
 * @file scripts/comment_rag/lib/vector_pack_io.mjs
 * @chapter The Sidecars Tell The Same Story Without Becoming Canon
 * @description
 * Streams vector matrices and metadata mirrors while keeping shard removal,
 * JSONL validation, and manifest writes explicit and testable.
 */

import fs from 'fs';

export function walSize(filePath) {
	return fs.existsSync(filePath) ? fs.statSync(filePath).size : null;
}

export function readJsonLines(filePath, validate) {
	return fs.readFileSync(filePath, 'utf8')
		.split(/\n/)
		.filter(Boolean)
		.map((line, index) => {
			const row = JSON.parse(line);
			validate(row, index);
			return row;
		});
}

export function removeShardArtifacts(shardPath) {
	for (const suffix of ['', '.wal', '.lock', '.readers']) {
		fs.rmSync(`${shardPath}${suffix}`, { force: true, recursive: true });
	}
}

export async function writeSidecars(records, options) {
	const metadataStream = fs.createWriteStream(options.metadataPath);
	const matrixHandle = fs.openSync(options.matrixPath, 'w');
	try {
		for (let rowIndex = 0; rowIndex < records.length; rowIndex++) {
			const row = records[rowIndex];
			const vector = new Float32Array(options.dimensions);
			for (let index = 0; index < options.dimensions; index++) vector[index] = row.vec[index];
			fs.writeSync(
				matrixHandle,
				Buffer.from(vector.buffer),
				0,
				options.dimensions * 4,
				rowIndex * options.dimensions * 4
			);
			metadataStream.write(`${JSON.stringify(options.metadataRecord(row))}\n`);
		}
	} finally {
		fs.closeSync(matrixHandle);
	}
	await new Promise((resolve, reject) => {
		metadataStream.once('error', reject);
		metadataStream.end(resolve);
	});
}

export function writeJson(filePath, value) {
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function fileBytes(filePath) {
	return fs.statSync(filePath).size;
}
