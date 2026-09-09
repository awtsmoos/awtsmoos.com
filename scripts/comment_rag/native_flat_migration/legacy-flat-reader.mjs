// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyFlatReader
 * @description
 * The Awtsmoos opens the old JSONL/F32 pair only as a one-way migration river;
 * Awtsmoos.com carries one row at a time into native storage without making legacy text a serving database.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import readline from 'node:readline';

const FLOAT_BYTES = 4;

/** Converts one fixed-size little-endian row buffer into an ordinary vector. */
function decodeVector(buffer, dimensions) {
	const vector = new Array(dimensions);
	for (let index = 0; index < dimensions; index += 1) {
		vector[index] = buffer.readFloatLE(index * FLOAT_BYTES);
	}
	return vector;
}

/** Returns exact matrix row count after validating persisted dimensions. */
async function matrixRows(file, dimensions) {
	const bytes = Number((await fsp.stat(file)).size || 0);
	const rowBytes = dimensions * FLOAT_BYTES;
	if (!dimensions || bytes % rowBytes !== 0) throw new Error('legacy_flat_matrix_shape_invalid');
	return bytes / rowBytes;
}

/**
 * Streams synchronized legacy metadata/vector rows with constant corpus memory.
 * @param {{metadataFile:string,matrixFile:string,dimensions:number}} options Legacy source files.
 * @yields {{metadata:object,vector:number[],rowIndex:number}} One migration row.
 */
export async function* legacyFlatRows(options) {
	const dimensions = Number(options.dimensions || 0);
	const expectedRows = await matrixRows(options.matrixFile, dimensions);
	const rowBytes = dimensions * FLOAT_BYTES;
	const matrix = await fsp.open(options.matrixFile, 'r');
	const lines = readline.createInterface({
		input: fs.createReadStream(options.metadataFile, 'utf8'),
		crlfDelay: Infinity
	});
	let rowIndex = 0;
	try {
		for await (const line of lines) {
			if (!line.trim()) continue;
			if (rowIndex >= expectedRows) throw new Error('legacy_flat_metadata_exceeds_matrix');
			const buffer = Buffer.allocUnsafe(rowBytes);
			const read = await matrix.read(buffer, 0, rowBytes, rowIndex * rowBytes);
			if (read.bytesRead !== rowBytes) throw new Error(`legacy_flat_short_vector:${rowIndex}`);
			let metadata;
			try {
				metadata = JSON.parse(line);
			} catch {
				throw new Error(`legacy_flat_metadata_parse_failed:${rowIndex}`);
			}
			yield { metadata, vector: decodeVector(buffer, dimensions), rowIndex };
			rowIndex += 1;
		}
		if (rowIndex !== expectedRows) {
			throw new Error(`legacy_flat_row_count_mismatch:${rowIndex}:${expectedRows}`);
		}
	} finally {
		lines.close();
		await matrix.close();
	}
}
