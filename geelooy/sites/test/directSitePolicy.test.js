//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeSiteRecord } = require('../../api/social/helper/drive/siteMappingPolicy.js');
const { effectiveSiteSource } = require('../../api/social/helper/drive/siteSourcePolicy.js');
const { assertDirectPublicPath } = require('../directSitePathPolicy.js');
const { virtualOsValueToBuffer } = require('../virtualOsSourceValue.js');
const { readVirtualOsSiteFile } = require('../virtualOsSiteSource.js');

/**
 * The Awtsmoos proves direct source must opt in, stay below its mapped root,
 * preserve binary bytes, and keep private metadata concealed from public roads.
 */

test('legacy mapping remains Drive snapshot while direct source is explicit', () => {
	const legacy = normalizeSiteRecord('docs', { rootPath: 'manual' }, {}, 10);
	assert.equal(legacy.source, undefined);
	assert.deepEqual(effectiveSiteSource(legacy), {
		kind: 'drive',
		mode: 'snapshot',
		rootPath: 'manual'
	});
	const direct = normalizeSiteRecord('live', {
		rootPath: 'projects/live',
		source: { kind: 'virtual-os', mode: 'direct', rootPath: 'projects/live' }
	}, {}, 20);
	assert.equal(direct.source.kind, 'virtual-os');
	assert.equal(direct.source.mode, 'direct');
});

test('private metadata paths are rejected while normal web assets remain public', () => {
	for (const path of ['.awtsmoos/site.json', '.git/config', '.env', 'keys/id_rsa']) {
		assert.throws(() => assertDirectPublicPath(path), /DIRECT_SITE_PATH_PRIVATE/);
	}
	assert.equal(assertDirectPublicPath('assets/app.js'), 'assets/app.js');
	assert.equal(assertDirectPublicPath('.well-known/site.txt'), '.well-known/site.txt');
});

test('hosted file values preserve text and binary bytes while folders remain distinct', () => {
	assert.equal(virtualOsValueToBuffer('abc').toString(), 'abc');
	assert.deepEqual([...virtualOsValueToBuffer([0, 127, 255])], [0, 127, 255]);
	assert.equal(virtualOsValueToBuffer({ child: 'folder' }), null);
});

test('direct reader binds public relative path beneath mapping source root', async () => {
	let captured = '';
	const $i = {
		db: {
			async read(path) {
				captured = path;
				return Buffer.from('B"H');
			}
		}
	};
	const file = await readVirtualOsSiteFile(
		$i,
		'alpha',
		'projects/orbit',
		'assets/app.js'
	);
	assert.equal(file.body.toString(), 'B"H');
	assert.match(captured, /aliases\/alpha\/fileSystem\/projects\/orbit\/assets\/app\.js$/);
});
