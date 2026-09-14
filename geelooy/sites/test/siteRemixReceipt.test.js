//B"H
//Boruch Hashem
//Blessed be He

/** Proves signed Remix attribution stays bounded, native, and server-verifiable. */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
	createSiteRemixReceipt,
	verifySiteRemixReceipt
} = require('../siteRemixReceipt.js');

function manifest() {
	return {
		aliasId: 'parent',
		siteId: 'demo',
		canonicalUrl: '/sites/parent/demo/',
		sourceKind: 'drive-deployment',
		sourceRevision: 'd-parent',
		files: [
			{ path: 'index.html', content: '<main>B"H</main>' },
			{ path: 'site.js', content: 'console.log("BH");' }
		]
	};
}

test('real server secret signs exact public Remix source', () => {
	const $i = { self: { secret: 'test-remix-secret' } };
	const receipt = createSiteRemixReceipt(manifest(), $i);
	assert.equal(receipt.kind, 'awtsmoos-site-remix-receipt-v1');
	const claim = verifySiteRemixReceipt(receipt, $i);
	assert.equal(claim.parent.publicUrl, '/sites/parent/demo/');
	assert.match(claim.sourceDigest, /^[a-f0-9]{64}$/);
});

test('tampering invalidates the Remix receipt', () => {
	const $i = { self: { secret: 'test-remix-secret' } };
	const receipt = createSiteRemixReceipt(manifest(), $i);
	const tampered = {
		...receipt,
		payload: `${receipt.payload}x`
	};
	assert.equal(verifySiteRemixReceipt(tampered, $i), null);
});

test('development fallback secret never creates verified receipt', () => {
	assert.equal(createSiteRemixReceipt(manifest(), {}), null);
});
