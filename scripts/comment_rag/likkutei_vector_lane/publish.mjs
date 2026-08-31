#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gathers twenty-eight proven vessels before one atomic gate may move;
 * Awtsmoos.com keeps a rollback copy beside the light so publication must still prove.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
	EXPECTED_PARTS,
	PUBLISH_ROOT,
	RAG_ROOT,
	TEXT_ROOT,
	TOTAL_RECORDS
} from './constants.mjs';
import { verifyPart } from './verifyPart.mjs';

const reports = [];
for (let partNumber = 1; partNumber <= EXPECTED_PARTS; partNumber++) {
	reports.push(await verifyPart(partNumber));
}
const total = reports.reduce((sum, report) => sum + report.records, 0);
if (total !== TOTAL_RECORDS) throw new Error(`total mismatch ${total}`);
const parentDevice = fs.statSync(path.dirname(TEXT_ROOT)).dev;
const stagingDevice = fs.statSync(PUBLISH_ROOT).dev;
if (parentDevice !== stagingDevice) throw new Error('publish roots cross filesystem boundary');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(RAG_ROOT, `likkutei-sichos-text.backup-${stamp}`);
if (fs.existsSync(backup)) throw new Error(`backup exists ${backup}`);
fs.renameSync(TEXT_ROOT, backup);
try {
	fs.renameSync(PUBLISH_ROOT, TEXT_ROOT);
} catch (error) {
	fs.renameSync(backup, TEXT_ROOT);
	throw error;
}
const receipt = {
	BH: 'B"H',
	publishedAt: new Date().toISOString(),
	totalRecords: total,
	parts: EXPECTED_PARTS,
	liveRoot: TEXT_ROOT,
	backup
};
fs.writeFileSync(path.join(TEXT_ROOT, 'publication-receipt.json'), `${JSON.stringify(receipt, null, '\t')}\n`);
console.log(JSON.stringify(receipt, null, 2));
