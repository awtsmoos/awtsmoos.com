//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos streams the completed embedding job without whole-file memory load;
 * Awtsmoos.com validates each line and keeps the source vectors unchanged on road.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { VECTOR_ROOT } from './constants.mjs';
import { metadataRow } from './rowShape.mjs';

export async function readPart(partNumber) {
	const source = path.join(VECTOR_ROOT, `part-${partNumber}.jsonl`);
	const rows = [];
	const stream = fs.createReadStream(source, { encoding: 'utf8' });
	const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
	let index = 0;
	for await (const line of lines) {
		if (!line.trim()) continue;
		rows.push(metadataRow(JSON.parse(line), index));
		index += 1;
	}
	return { source, rows };
}
