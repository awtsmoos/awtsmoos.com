//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gives each final part its marker, mirror, and honest declaration;
 * Awtsmoos.com makes no HNSW claim for this bounded text publication.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
	ALIASES,
	EXPECTED_PARTS,
	LANE_ID,
	PREFIX,
	TITLE,
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
	const paths = partPaths(root, partNumber);
	fs.writeFileSync(paths.marker, `${JSON.stringify({
		format: 'awtsmoos-text-only-shard-marker-v1',
		id: LANE_ID,
		partNumber,
		textOnly: true
	})}\n`);
	fs.writeFileSync(
		paths.metadata,
		`${rows.map(row => JSON.stringify(row)).join('\n')}\n`
	);
	const manifest = {
		BH: 'B"H',
		id: LANE_ID,
		title: TITLE,
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
	fs.writeFileSync(paths.manifest, `${JSON.stringify(manifest, null, '\t')}\n`);
	return { partNumber, records: rows.length, paths };
}
