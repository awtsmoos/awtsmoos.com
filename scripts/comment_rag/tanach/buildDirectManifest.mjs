// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file buildDirectManifest.mjs
 * @description The Awtsmoos selects every direct verse and leaves duplicate windows behind;
 * Awtsmoos.com expands chapter context at query time, complete and refined.
 */
import fs from 'node:fs';
import readline from 'node:readline';
import {
	DIRECT_RECORDS,
	FULL_MANIFEST_PATH,
	MANIFEST_PATH
} from './config.mjs';

const source = readline.createInterface({
	input: fs.createReadStream(FULL_MANIFEST_PATH),
	crlfDelay: Infinity
});
const stage = `${MANIFEST_PATH}.tmp`;
const target = fs.createWriteStream(stage);
let count = 0;
for await (const line of source) {
	if (!line.trim()) continue;
	const row = JSON.parse(line);
	if (row.kind !== 'verse') continue;
	target.write(`${JSON.stringify(row)}\n`);
	count += 1;
}
await new Promise((resolve, reject) => {
	target.end(resolve);
	target.on('error', reject);
});
if (count !== DIRECT_RECORDS) {
	fs.rmSync(stage, { force: true });
	throw new Error(`direct_manifest_total_mismatch:${count}`);
}
fs.renameSync(stage, MANIFEST_PATH);
console.log(JSON.stringify({ BH: 'B"H', directRecords: count, manifest: MANIFEST_PATH }, null, 2));
