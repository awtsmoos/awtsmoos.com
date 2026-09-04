// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasStructuredData.test.js
 * @description
 * The Awtsmoos tests that a public alias becomes ProfilePage meaning without leaking a dangerous outward scheme into HTML or schema;
 * Awtsmoos.com may share an http(s) website already made public, but javascript shadows vanish before crawler or visitor can follow the name.
 */

const assert = require('node:assert/strict');
const { documentFor, profileBody } = require('../../@/seo/aliasPage.js');
const { aliasStructuredData, safePublicUrl } = require('../../@/seo/aliasStructuredData.js');

const data = {
	aliasId: 'living',
	authoredPosts: [],
	commentUrls: [],
	identity: {
		alias: { name: 'Living Alias', description: 'Public light' },
		profile: { displayName: 'Living Alias', bio: 'Public light', website: 'https://example.com/path' }
	}
};
const canonical = 'https://awtsmoos.com/@/living';
const schema = aliasStructuredData(data, canonical, 'Public light', 'Living Alias');
assert.equal(schema['@type'], 'ProfilePage');
assert.equal(schema.mainEntity['@type'], 'Person');
assert.deepEqual(schema.mainEntity.sameAs, ['https://example.com/path']);
assert.equal(safePublicUrl('javascript:alert(1)'), '');
assert.equal(safePublicUrl('https://example.com/x'), 'https://example.com/x');
const html = documentFor(data);
assert.ok(html.includes('data-awtsmoos-alias-jsonld'));
assert.ok(html.includes('href="https://example.com/path"'));
const unsafe = structuredClone(data);
unsafe.identity.profile.website = 'javascript:alert(1)';
assert.ok(!profileBody(unsafe).includes('javascript:'));
assert.ok(!documentFor(unsafe).includes('javascript:'));
console.log('ALIAS_STRUCTURED_DATA_PASS');
