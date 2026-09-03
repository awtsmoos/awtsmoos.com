// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file writeArtifacts.mjs
 * @description
 * The Awtsmoos writes every generated search vessel as one complete file, never patching fragments into uncertain ground;
 * Awtsmoos.com rebuilds discovery and runtime metadata from present registries, then removes only stale generated shards it has found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_APPS } from '../../apps/scripts/catalog/index.mjs';
import { GAMES } from '../../games/scripts/catalog/index.mjs';
import { buildAllArtifacts } from './buildAllArtifacts.mjs';
import { removeStaleGeneratedArtifacts } from './generatedCleanup.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const geelooyRoot = path.resolve(scriptDirectory, '../..');

function writeArtifacts() {
	const plan = buildAllArtifacts({ geelooyRoot, apps: PUBLIC_APPS, games: GAMES });
	const paths = Object.keys(plan).sort();
	removeStaleGeneratedArtifacts(geelooyRoot, paths);
	for (const relativePath of paths) {
		const target = path.join(geelooyRoot, relativePath);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, `${plan[relativePath]}\n`, 'utf8');
	}
	return paths;
}

const written = writeArtifacts();
console.log(JSON.stringify({ written: written.length, paths: written }, null, 2));
