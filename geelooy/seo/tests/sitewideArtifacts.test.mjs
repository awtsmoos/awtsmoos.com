// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitewideArtifacts.test.mjs
 * @description
 * The Awtsmoos tests that generated search roads still mirror today's registries and corpus rather than yesterday's memory;
 * Awtsmoos.com distinguishes public worlds like Editor from true action segments, catching unsafe paths without hiding legitimate light.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC_APPS } from '../../apps/scripts/catalog/index.mjs';
import { GAMES } from '../../games/scripts/catalog/index.mjs';
import { buildArtifactPlan, ROOT_SITEMAPS } from '../../scripts/seo/artifactPlan.mjs';
import { applicationEntries, catalogPaths } from '../../scripts/seo/catalogPaths.mjs';

const root = path.resolve('geelooy');
const plan = buildArtifactPlan({ geelooyRoot: root, apps: PUBLIC_APPS, games: GAMES });
const forbiddenSegments = new Set(['edit', 'submit', 'delete', 'admin', 'internal', 'debug', 'staging']);

function locations(xml) {
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
}

function isForbidden(url) {
	const parsed = new URL(url);
	if (parsed.pathname === '/api' || parsed.pathname.startsWith('/api/')) {
		return true;
	}
	const segments = parsed.pathname.split('/').filter(Boolean);
	return segments.some(segment => forbiddenSegments.has(segment));
}

for (const [relative, expected] of Object.entries(plan)) {
	const actual = fs.readFileSync(path.join(root, relative), 'utf8');
	assert.equal(actual, `${expected}\n`, `stale generated artifact: ${relative}`);
}

for (const family of ROOT_SITEMAPS) {
	assert.ok(plan['sitemap.xml'].includes(`https://awtsmoos.com${family}`), `missing root family ${family}`);
}

const xmlFiles = Object.entries(plan).filter(([relative]) => relative.endsWith('.xml'));
const allLocations = xmlFiles.flatMap(([, xml]) => locations(xml));
assert.deepEqual(allLocations.filter(isForbidden), []);

const appEntries = applicationEntries(PUBLIC_APPS);
const appPaths = catalogPaths(appEntries, '/apps/');
const gamePaths = catalogPaths(GAMES, '/games/');
assert.equal(locations(plan['apps/sitemap.xml']).length, appPaths.length + 1);
assert.equal(locations(plan['games/sitemap.xml']).length, gamePaths.length + 1);
assert.ok(plan['apps/sitemap.xml'].includes('https://awtsmoos.com/apps/editor/'));
assert.ok(plan['apps/catalog.html'].includes('data-awtsmoos-seo-catalog'));
assert.ok(plan['games/catalog.html'].includes('data-awtsmoos-seo-catalog'));
assert.ok(plan['robots.txt'].includes('Disallow: /api/'));
assert.ok(plan['robots.txt'].includes('Sitemap: https://awtsmoos.com/sitemap.xml'));
console.log('SITEWIDE_ARTIFACT_REGRESSION_PASS');
