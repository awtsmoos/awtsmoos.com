//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gives every bounded part its marker, mirror, and declaration;
 * Awtsmoos.com receives no vector pretense, only truthful text publication.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
	ALIASES,
	EXPECTED_PARTS,
	LANE_ID,
	LANE_TITLE,
	PREFIX,
	TOTAL_RECORDS
} from './constants.mjs';

export function partPaths(root, partNumber) {
	const base = path.join(root, `${PREFIX}-part-${partNumber}`);
	return {
		marker: `${base}.awtsdb`,
		metadata: `${base}.meta.jsonl`,
		manifest: `${base}.fast-manifest.json`
	};
}

export function writePart(root, partNumber, rows) {
	const files = partPaths(root, partNumber);
	const marker = {
		format: 'awtsmoos-text-only-shard-marker-v1',
		id: LANE_ID,
		partNumber,
		textOnly: true
	};
	fs.writeFileSync(files.marker, `${JSON.stringify(marker)}\n`);
	fs.writeFileSync(
		files.metadata,
		`${rows.map(row => JSON.stringify(row)).join('\n')}\n`
	);
	const manifest = {
		id: LANE_ID,
		title: LANE_TITLE,
		aliases: [...ALIASES],
		partId: `part-${partNumber}`,
		partNumber,
		expectedParts: EXPECTED_PARTS,
		records: rows.length,
		listLength: rows.length,
		totalRecords: TOTAL_RECORDS,
		dimensions: 0,
		listName: null,
		textOnly: true,
		partial: false,
		vectorEnabled: false,
		format: 'jsonl-text-mirror-v1'
	};
	fs.writeFileSync(files.manifest, `${JSON.stringify(manifest, null, '\t')}\n`);
	return {
		partNumber,
		records: rows.length,
		files
	};
}
