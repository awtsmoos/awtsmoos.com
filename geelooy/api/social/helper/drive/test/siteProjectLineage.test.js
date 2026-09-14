//B"H
//Boruch Hashem
//Blessed be He

/** Proves signed Remix attribution stays bounded, native, and server-verifiable. */
const assert = require('node:assert/strict');
const test = require('node:test');
const { createSiteRemixReceipt } = require('../../../../../sites/siteRemixReceipt.js');
const {
	prepareBootstrapSource,
	PUBLIC_LINEAGE_PATH
} = require('../siteProjectLineage.js');

function parentManifest() {
	return {
		aliasId: 'parent',
		siteId: 'seed',
		canonicalUrl: '/sites/parent/seed/',
		sourceKind: 'drive-deployment',
		sourceRevision: 'd-seed',
		files: [{ path: 'index.html', content: '<h1>B"H</h1>' }]
	};
}

function childOptions(receipt) {
	return {
		aliasId: 'child',
		siteId: 'fork',
		projectId: 'fork',
		$i: { self: { secret: 'lineage-secret' } },
		remixReceipt: receipt,
		files: [
			{ path: 'index.html', content: '<h1>Child</h1>' },
			{ path: PUBLIC_LINEAGE_PATH, content: '{"verified":false}' },
			{ path: '.awtsmoos-remix-origin.json', content: '{"fake":true}' }
		]
	};
}

test('server receipt mints verified child lineage and strips client testimony', () => {
	const $i = { self: { secret: 'lineage-secret' } };
	const receipt = createSiteRemixReceipt(parentManifest(), $i);
	const files = prepareBootstrapSource(childOptions(receipt));
	const lineage = files.find(file => file.path === PUBLIC_LINEAGE_PATH);
	const parsed = JSON.parse(lineage.content);
	assert.equal(parsed.verified, true);
	assert.equal(parsed.current.publicUrl, '/sites/child/fork/');
	assert.equal(parsed.parent.publicUrl, '/sites/parent/seed/');
	assert.match(parsed.parentSourceDigest, /^[a-f0-9]{64}$/);
	assert.equal(files.some(file => file.path.startsWith('.awtsmoos-remix-origin')), false);
});

test('tampered receipt fails before source publication', () => {
	const $i = { self: { secret: 'lineage-secret' } };
	const receipt = createSiteRemixReceipt(parentManifest(), $i);
	const bad = { ...receipt, signature: `${receipt.signature}x` };
	assert.throws(
		() => prepareBootstrapSource(childOptions(bad)),
		error => error.code === 'REMIX_RECEIPT_INVALID'
	);
});

test('without a receipt client lineage is stripped rather than trusted', () => {
	const files = prepareBootstrapSource(childOptions(null));
	assert.equal(files.some(file => file.path === PUBLIC_LINEAGE_PATH), false);
	assert.equal(files.some(file => file.path.startsWith('.awtsmoos-remix-origin')), false);
	assert.equal(files.some(file => file.path === 'index.html'), true);
});
