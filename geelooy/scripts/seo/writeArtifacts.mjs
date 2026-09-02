// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file writeArtifacts.mjs
 * @description
 * The Awtsmoos writes each generated discovery vessel as one complete file, never patching a fragment into uncertain ground;
 * Awtsmoos.com rebuilds catalogs and sitemaps from present registries, then removes stale translation shards that no longer surround.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_APPS } from '../../apps/scripts/catalog/index.mjs';
import { GAMES } from '../../games/scripts/catalog/index.mjs';
import { buildArtifactPlan } from './artifactPlan.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const geelooyRoot = path.resolve(scriptDirectory, '../..');

function removeStaleTranslationArtifacts(plannedPaths) {
	const translationRoot = path.join(geelooyRoot, 'translations');
	if (!fs.existsSync(translationRoot)) {
		return;
	}
	const planned = new Set(plannedPaths.filter(item => item.startsWith('translations/')));
	for (const entry of fs.readdirSync(translationRoot)) {
		if (!/^(?:sitemap-|catalog-)\d+\.(?:xml|html)$/.test(entry)) {
			continue;
		}
		const relative = `translations/${entry}`;
		if (!planned.has(relative)) {
			fs.rmSync(path.join(translationRoot, entry));
		}
	}
}

function writeArtifacts() {
	const plan = buildArtifactPlan({ geelooyRoot, apps: PUBLIC_APPS, games: GAMES });
	const paths = Object.keys(plan).sort();
	removeStaleTranslationArtifacts(paths);
	for (const relativePath of paths) {
		const target = path.join(geelooyRoot, relativePath);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, `${plan[relativePath]}\n`, 'utf8');
	}
	return paths;
}

const written = writeArtifacts();
console.log(JSON.stringify({ written: written.length, paths: written }, null, 2));
