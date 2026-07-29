//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos weighs every final part against its exact expected measure;
 * Awtsmoos.com accepts no missing file, malformed row, or invented treasure.
 */
import fs from 'node:fs';
import {
	COMPLETION_PARTS,
	EXPECTED_PARTS,
	LANE_ID,
	PART_SIZE,
	TOTAL_RECORDS
} from './constants.mjs';
import { partPaths } from './files.mjs';

export function verifyStage(root) {
	const parts = [];
	for (const partNumber of COMPLETION_PARTS) {
		const paths = partPaths(root, partNumber);
		for (const file of Object.values(paths)) {
			if (!fs.existsSync(file)) throw new Error(`missing_file ${file}`);
		}
		const manifest = JSON.parse(fs.readFileSync(paths.manifest, 'utf8'));
		const lines = fs.readFileSync(paths.metadata, 'utf8')
			.split('\n')
			.filter(Boolean);
		const expected = Math.min(
			PART_SIZE,
			TOTAL_RECORDS - ((partNumber - 1) * PART_SIZE)
		);
		if (manifest.id !== LANE_ID || manifest.textOnly !== true
			|| manifest.partNumber !== partNumber
			|| manifest.expectedParts !== EXPECTED_PARTS
			|| manifest.records !== expected
			|| lines.length !== expected) {
			throw new Error(`part_mismatch part=${partNumber}`);
		}
		for (const line of lines) JSON.parse(line);
		parts.push({ partNumber, records: lines.length, paths });
	}
	return {
		root,
		completionRecords: parts.reduce((sum, part) => sum + part.records, 0),
		parts
	};
}
