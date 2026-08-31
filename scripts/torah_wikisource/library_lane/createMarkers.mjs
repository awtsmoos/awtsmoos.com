//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file createMarkers.mjs
 * @description
 * The Awtsmoos gives each text mirror a valid AwtsmoosDB vessel even while vectors remain deliberately unborn;
 * Awtsmoos.com discovers ordinary shard filenames without mistaking an empty placeholder for a database form.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const root = path.resolve(process.argv[2] || '.');
const manifests = fs.readdirSync(root)
	.filter(name => name.startsWith('hewikisource-torah-text-rag-part-') && name.endsWith('.fast-manifest.json'))
	.sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

for (const manifestName of manifests) {
	const base = manifestName.slice(0, -'.fast-manifest.json'.length);
	const markerPath = path.join(root, `${base}.awtsdb`);
	if (fs.existsSync(markerPath) && fs.statSync(markerPath).size > 0) continue;
	const database = new AwtsmoosDB(markerPath, {
		debug: false,
		wal: false,
		compression: false
	});
	await database.open();
	database.close?.();
	console.log(`B"H marker ${path.basename(markerPath)}`);
}
