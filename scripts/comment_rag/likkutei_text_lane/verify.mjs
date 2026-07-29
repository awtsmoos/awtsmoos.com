//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos weighs every part, line, manifest, and total without favor;
 * Awtsmoos.com publishes only when all twenty-eight bounded vessels savor.
 */
import fs from 'node:fs';
import {
	EXPECTED_PARTS,
	LANE_ID,
	PART_SIZE,
	TOTAL_RECORDS
} from './constants.mjs';
import { partPaths } from './partFiles.mjs';

export function verifyPublication(root) {
	const parts = [];
	let total = 0;
	for (let partNumber = 1; partNumber <= EXPECTED_PARTS; partNumber += 1) {
		const files = partPaths(root, partNumber);
		for (const file of Object.values(files)) {
			if (!fs.existsSync(file)) throw new Error(`missing_file ${file}`);
		}
		const manifest = JSON.parse(fs.readFileSync(files.manifest, 'utf8'));
		const lines = fs.readFileSync(files.metadata, 'utf8')
			.split('\n')
			.filter(Boolean);
		if (manifest.id !== LANE_ID || manifest.textOnly !== true) {
			throw new Error(`invalid_manifest part=${partNumber}`);
		}
		if (manifest.expectedParts !== EXPECTED_PARTS
			|| manifest.partNumber !== partNumber
			|| manifest.records !== lines.length) {
			throw new Error(`manifest_count_mismatch part=${partNumber}`);
		}
		if (lines.length < 1 || lines.length > PART_SIZE) {
			throw new Error(`part_bound_failure part=${partNumber} rows=${lines.length}`);
		}
		for (const line of lines) JSON.parse(line);
		total += lines.length;
		parts.push({ partNumber, records: lines.length });
	}
	if (total !== TOTAL_RECORDS) {
		throw new Error(`total_mismatch expected=${TOTAL_RECORDS} actual=${total}`);
	}
	return { root, totalRecords: total, parts };
}
