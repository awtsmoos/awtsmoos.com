//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos draws verified English rows from thirty-nine volumes into bounds;
 * Awtsmoos.com atomically receives the complete lane only when every proof resounds.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
	EXPECTED_MALFORMED,
	OUTPUT_ROOT,
	PART_SIZE,
	TOTAL_RECORDS
} from './constants.mjs';
import {
	closeCorpus,
	openCorpus,
	readRows,
	references
} from './corpus.mjs';
import { writePart } from './partFiles.mjs';
import { publicLikkuteiRow } from './rowShape.mjs';
import { verifyPublication } from './verify.mjs';

const stage = `${OUTPUT_ROOT}.stage-${process.pid}`;
const parent = path.dirname(OUTPUT_ROOT);
fs.mkdirSync(parent, { recursive: true });
if (fs.existsSync(stage)) throw new Error(`stage_exists ${stage}`);
fs.mkdirSync(stage);
const database = openCorpus();
const malformed = [];
const parts = [];
let buffer = [];
let total = 0;

try {
	for (const reference of references(database)) {
		const rows = readRows(database, reference);
		if (!rows?.length) {
			malformed.push(`${reference.seriesId}/${reference.postId}`);
			continue;
		}
		for (const sourceRow of rows) {
			const row = publicLikkuteiRow(sourceRow, reference);
			if (!row) throw new Error(`invalid_row ${reference.path}`);
			buffer.push(row);
			total += 1;
			if (buffer.length === PART_SIZE) flush();
		}
	}
	if (buffer.length) flush();
} finally {
	closeCorpus(database);
}

assertMalformed(malformed);
if (total !== TOTAL_RECORDS) {
	throw new Error(`generated_total_mismatch expected=${TOTAL_RECORDS} actual=${total}`);
}
const verified = verifyPublication(stage);
const summary = {
	generatedAt: new Date().toISOString(),
	sourceReadOnly: true,
	malformed,
	...verified
};
fs.writeFileSync(
	path.join(stage, 'likkutei-sichos-text-publication.json'),
	`${JSON.stringify(summary, null, '\t')}\n`
);
if (fs.existsSync(OUTPUT_ROOT)) {
	fs.renameSync(OUTPUT_ROOT, `${OUTPUT_ROOT}.backup-${Date.now()}`);
}
fs.renameSync(stage, OUTPUT_ROOT);
console.log(JSON.stringify(summary, null, 2));

function flush() {
	parts.push(writePart(stage, parts.length + 1, buffer));
	buffer = [];
}

function assertMalformed(actual) {
	const found = new Set(actual);
	if (found.size !== EXPECTED_MALFORMED.size
		|| [...EXPECTED_MALFORMED].some(value => !found.has(value))) {
		throw new Error(`unexpected_malformed ${JSON.stringify(actual)}`);
	}
}
