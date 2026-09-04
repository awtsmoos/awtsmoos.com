// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicHtmlSeo.test.js
 * @description
 * The Awtsmoos tests that registered static worlds gain semantic and structured light without losing what their authors already wrote;
 * Awtsmoos.com lets the authored title guide social identity, preserves authored head truth, and leaves every unknown fragment bright.
 */

const assert = require('node:assert/strict');
const path = require('path');
const metadata = require('../generated/public-pages/index.js');
const { revealPublicHtmlSeo, relativeFile } = require('../../../ayzarim/awtsmoosDynamicServer/static/PublicHtmlSeo.js');

const repoRoot = path.resolve('.');
const pianoFile = 'apps/piano/index.html';
const piano = metadata.get(pianoFile);
const pianoPath = path.join(repoRoot, 'geelooy', pianoFile);
const context = { filePath: pianoPath, rootDir: repoRoot };
const canonical = `https://awtsmoos.com${piano.canonicalPath}`;

assert.ok(piano && piano.canonicalPath.endsWith('/'));
assert.equal(relativeFile(context), pianoFile);
assert.equal(relativeFile({ filePath: pianoPath, rootDir: path.join(repoRoot, 'geelooy') }), pianoFile);

const minimal = '<!DOCTYPE html><html><head><title>Authored Piano &amp; Light</title></head><body><main>Piano</main></body></html>';
const enriched = revealPublicHtmlSeo(minimal, context);
assert.ok(enriched.includes('<title>Authored Piano &amp; Light</title>'));
assert.ok(enriched.includes('<meta property="og:title" content="Authored Piano &amp; Light">'));
assert.ok(enriched.includes('<meta name="twitter:title" content="Authored Piano &amp; Light">'));
assert.ok(enriched.includes(`<link rel="canonical" href="${canonical}">`));
assert.ok(enriched.includes(`<meta property="og:url" content="${canonical}">`));
assert.ok(enriched.includes('<meta property="og:site_name" content="Awtsmoos">'));
assert.ok(enriched.includes('<script type="application/ld+json" data-awtsmoos-public-jsonld>'));
const json = enriched.match(/data-awtsmoos-public-jsonld>([^<]+)<\/script>/)[1];
const structured = JSON.parse(json);
assert.equal(structured['@type'], 'SoftwareApplication');
assert.equal(structured.name, 'Authored Piano & Light');
assert.equal(structured.url, canonical);

const authored = '<html><head><title>Mine</title><meta name="description" content="Mine"><meta name="robots" content="noindex"><link rel="canonical" href="https://example.test/mine"><meta property="og:title" content="My OG"><script type="application/ld+json">{"@type":"Thing"}</script></head><body></body></html>';
const preserved = revealPublicHtmlSeo(authored, context);
assert.equal((preserved.match(/name="description"/g) || []).length, 1);
assert.equal((preserved.match(/name="robots"/g) || []).length, 1);
assert.equal((preserved.match(/rel="canonical"/g) || []).length, 1);
assert.equal((preserved.match(/application\/ld\+json/g) || []).length, 1);
assert.ok(preserved.includes('content="noindex"') && preserved.includes('content="My OG"'));
assert.ok(preserved.includes('href="https://example.test/mine"'));

const unknown = '<html><head><title>Unknown</title></head><body>Untouched</body></html>';
assert.equal(revealPublicHtmlSeo(unknown, { filePath: path.join(repoRoot, 'geelooy/unknown/index.html'), rootDir: repoRoot }), unknown);
assert.equal(revealPublicHtmlSeo('<p>fragment</p>', context), '<p>fragment</p>');
console.log('PUBLIC_HTML_SEO_REGRESSION_PASS');
