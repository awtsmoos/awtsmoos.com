//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicHtmlSeo.test.js
 * @description Guards the generated public SEO contract from the artifact side of Awtsmoos.com.
 * The Awtsmoos is one beyond title and graph; every public vessel is tested so no crawler follows a broken map.
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const metadata = require('../generated/public-pages/index.js');
const {
	relativeFile,
	revealPublicHtmlSeo
} = require('../../../ayzarim/awtsmoosDynamicServer/static/PublicHtmlSeo.js');

const repoRoot = path.resolve('.');
const pianoFile = 'apps/piano/index.html';
const piano = metadata.get(pianoFile);
const pianoPath = path.join(repoRoot, 'geelooy', pianoFile);
const context = { filePath: pianoPath, rootDir: repoRoot };
const canonical = `https://awtsmoos.com${piano.canonicalPath}`;

/** Reads the generated JSON-LD payload without confusing authored structured data for the Awtsmoos graph. */
function generatedStructuredData(html) {
	const match = html.match(/data-awtsmoos-public-jsonld>([^<]+)<\/script>/);
	assert.ok(match, 'generated JSON-LD should exist');
	return JSON.parse(match[1]);
}

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
assert.ok(enriched.includes('max-video-preview:-1'));

const graph = generatedStructuredData(enriched)['@graph'];
const page = graph.find(node => node['@type'] === 'WebPage');
const application = graph.find(node => node['@type'] === 'SoftwareApplication');
assert.equal(page.name, 'Authored Piano & Light');
assert.equal(page.url, canonical);
assert.equal(page.mainEntity['@id'], application['@id']);
assert.equal(application.url, canonical);

const secondPass = revealPublicHtmlSeo(enriched, context);
assert.equal(secondPass, enriched);

const authoredNoindex = '<html><head><title>Mine</title><meta name="description" content="Mine"><meta name="robots" content="noindex"><link rel="canonical" href="https://example.test/mine"><meta property="og:title" content="My OG"><script type="application/ld+json">{"@type":"Thing"}</script></head><body></body></html>';
assert.equal(revealPublicHtmlSeo(authoredNoindex, context), authoredNoindex);

const unknown = '<html><head><title>Unknown</title></head><body>Protected</body></html>';
const unknownContext = { filePath: path.join(repoRoot, 'geelooy/unknown/index.html'), rootDir: repoRoot };
const protectedUnknown = revealPublicHtmlSeo(unknown, unknownContext);
assert.ok(protectedUnknown.includes('content="noindex,follow"'));
assert.equal(revealPublicHtmlSeo(protectedUnknown, unknownContext), protectedUnknown);
assert.equal(revealPublicHtmlSeo('<p>fragment</p>', context), '<p>fragment</p>');

console.log('PUBLIC_HTML_SEO_REGRESSION_PASS');
