//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos reveals the final English mirrors in an isolated atomic stage;
 * Awtsmoos.com promotes nothing here, but prepares proof for the deployment page.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
	COMPLETION_PARTS,
	OUTPUT_ROOT
} from './constants.mjs';
import { writePart } from './files.mjs';
import { readPart } from './source.mjs';
import { verifyStage } from './verify.mjs';

const stage = `${OUTPUT_ROOT}.stage-${process.pid}`;
fs.mkdirSync(path.dirname(OUTPUT_ROOT), { recursive: true });
if (fs.existsSync(stage)) throw new Error(`stage_exists ${stage}`);
fs.mkdirSync(stage);
const sourceProof = [];
for (const partNumber of COMPLETION_PARTS) {
	const source = await readPart(partNumber);
	const written = writePart(stage, partNumber, source.rows);
	sourceProof.push({
		partNumber,
		source: source.source,
		records: written.records
	});
}
const verification = verifyStage(stage);
const summary = {
	generatedAt: new Date().toISOString(),
	sourceVectorsReadOnly: true,
	sourceProof,
	...verification
};
fs.writeFileSync(
	path.join(stage, 'sichos-kodesh-text-completion.json'),
	`${JSON.stringify(summary, null, '\t')}\n`
);
if (fs.existsSync(OUTPUT_ROOT)) {
	fs.renameSync(OUTPUT_ROOT, `${OUTPUT_ROOT}.backup-${Date.now()}`);
}
fs.renameSync(stage, OUTPUT_ROOT);
console.log(JSON.stringify(summary, null, 2));
