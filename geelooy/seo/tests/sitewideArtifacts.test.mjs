// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitewideArtifacts.test.mjs
 * @description
 * The Awtsmoos tests every generated discovery and metadata vessel against today's registries and authored public pages;
 * Awtsmoos.com rejects stale, redirecting, or action roads while root, Heichel, apps, games, translations, and public information remain in phase.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC_APPS } from '../../apps/scripts/catalog/index.mjs';
import { GAMES } from '../../games/scripts/catalog/index.mjs';
import { buildAllArtifacts } from '../../scripts/seo/buildAllArtifacts.mjs';
import { CORE_PUBLIC_PATHS } from '../../scripts/seo/corePaths.mjs';

const root = path.resolve('geelooy');
const plan = buildAllArtifacts({ geelooyRoot: root, apps: PUBLIC_APPS, games: GAMES });
const forbiddenSegments = new Set(['edit', 'submit', 'delete', 'admin', 'internal', 'debug', 'staging']);

function locations(xml) {
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
}

function isForbidden(url) {
	const pathname = new URL(url).pathname;
	if (pathname === '/api' || pathname.startsWith('/api/')) return true;
	return pathname.split('/').filter(Boolean).some(segment => forbiddenSegments.has(segment));
}

for (const [relative, expected] of Object.entries(plan)) {
	const actual = fs.readFileSync(path.join(root, relative), 'utf8');
	assert.equal(actual, `${expected}\n`, `stale generated artifact: ${relative}`);
}

const allLocations = Object.entries(plan)
	.filter(([relative]) => relative.endsWith('.xml'))
	.flatMap(([, xml]) => locations(xml));
assert.deepEqual(allLocations.filter(isForbidden), []);
for (const publicPath of CORE_PUBLIC_PATHS) {
	assert.ok(plan['sitemaps/core.xml'].includes(`https://awtsmoos.com${publicPath}`));
}
assert.ok(!plan['sitemaps/core.xml'].includes('<loc>https://awtsmoos.com/heichelos</loc>'));
for (const excluded of ['/login/', '/logout/', '/control/', '/donate/']) {
	assert.ok(!plan['sitemaps/core.xml'].includes(`https://awtsmoos.com${excluded}`));
}

const metadata = await import('../../scripts/seo/publicPageMetadata.mjs');
const records = metadata.publicPageMetadataRecords(PUBLIC_APPS, GAMES, root);
const byFile = new Map(records.map(record => [record.filePath, record]));
for (const file of ['index.html', 'about/index.html', 'apps/index.html', 'docs/index.html', 'games/index.html', 'social/index.html', 'contact/index.html']) {
	assert.ok(byFile.has(file), `missing curated metadata for ${file}`);
}
assert.ok(records.length >= 82);
assert.ok(plan['robots.txt'].includes('Disallow: /api/'));
assert.ok(plan['apps/sitemap.xml'].includes('https://awtsmoos.com/apps/editor/'));
console.log('SITEWIDE_ARTIFACT_REGRESSION_PASS');
