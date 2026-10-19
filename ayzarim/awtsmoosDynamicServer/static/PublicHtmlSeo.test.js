//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicHtmlSeo.test.js
 * @description Proves the server SEO gate reveals public truth and protects unclassified vessels.
 * The Awtsmoos is one beyond graph and gate; Awtsmoos.com tests each finite signal before crawlers meet its fate.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
	publicMetadata,
	revealPublicHtmlSeo
} = require('./PublicHtmlSeo.js');

const repoRoot = path.resolve(__dirname, '../../..');
const appRelative = 'apps/captions/video/index.html';
const appFile = path.join(repoRoot, 'geelooy', appRelative);

/** Extracts the generated Awtsmoos JSON-LD graph from transformed HTML. */
function generatedGraph(html) {
	const match = html.match(/<script[^>]*data-awtsmoos-public-jsonld[^>]*>([\s\S]*?)<\/script>/i);
	assert.ok(match, 'missing generated JSON-LD');
	return JSON.parse(match[1]);
}

/** Creates the real file-server context shape for one Geelooy-relative document. */
function contextFor(relativeFile) {
	return {
		filePath: path.join(repoRoot, 'geelooy', relativeFile),
		rootDir: repoRoot
	};
}

test('registry metadata preserves canonical directory identity', () => {
	const metadata = publicMetadata(appRelative);
	assert.equal(metadata.canonicalPath, '/apps/captions/video/');
	assert.equal(metadata.kind, 'app');
});

test('public HTML receives canonical, social, robots, and linked JSON-LD testimony', () => {
	const source = fs.readFileSync(appFile, 'utf8');
	const result = revealPublicHtmlSeo(source, contextFor(appRelative));
	assert.match(result, /rel="canonical" href="https:\/\/awtsmoos\.com\/apps\/captions\/video\/"/);
	assert.match(result, /max-video-preview:-1/);
	assert.match(result, /property="og:url" content="https:\/\/awtsmoos\.com\/apps\/captions\/video\/"/);
	const graph = generatedGraph(result)['@graph'];
	const page = graph.find(node => node['@type'] === 'WebPage');
	const app = graph.find(node => node['@type'] === 'SoftwareApplication');
	assert.equal(page.mainEntity['@id'], app['@id']);
	assert.equal(app.url, 'https://awtsmoos.com/apps/captions/video/');
});

test('a second SEO transform is byte-for-byte idempotent', () => {
	const source = fs.readFileSync(appFile, 'utf8');
	const once = revealPublicHtmlSeo(source, contextFor(appRelative));
	assert.equal(revealPublicHtmlSeo(once, contextFor(appRelative)), once);
});

test('unclassified complete HTML receives one conservative noindex policy', () => {
	const source = '<!doctype html><html><head><title>Unknown</title></head><body></body></html>';
	const context = contextFor('private-tool/index.html');
	const once = revealPublicHtmlSeo(source, context);
	assert.match(once, /content="noindex,follow" data-awtsmoos-search-policy="private"/);
	assert.equal(revealPublicHtmlSeo(once, context), once);
});

test('authored noindex remains sovereign even on a registry-backed route', () => {
	const source = '<!doctype html><html><head><title>Private Preview</title><meta name="robots" content="noindex,nofollow"></head><body></body></html>';
	assert.equal(revealPublicHtmlSeo(source, contextFor(appRelative)), source);
});

test('descriptive self-canonical authored HTML can establish public identity', () => {
	const relative = 'public-self/index.html';
	const source = '<!doctype html><html><head><title>Public Self</title><meta name="description" content="A deliberate public Awtsmoos page."><link rel="canonical" href="https://awtsmoos.com/public-self/"></head><body></body></html>';
	const result = revealPublicHtmlSeo(source, contextFor(relative));
	assert.match(result, /content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/);
	assert.match(result, /data-awtsmoos-public-jsonld/);
	assert.doesNotMatch(result, /data-awtsmoos-search-policy="private"/);
});
