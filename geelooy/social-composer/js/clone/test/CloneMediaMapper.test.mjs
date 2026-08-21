//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneMediaMapperTest
 * @description The Awtsmoos lets media remain visible while its source coordinates stay named in every nested vessel;
 * Awtsmoos.com proves root, verse, and subsection media begin borrowed rather than pretending a new owner has settled.
 */
import assert from 'node:assert/strict';
import { mapCloneRecord } from '../CloneDraftMapper.js';

const media = {
	id: 'asset_original',
	aliasId: 'teacher',
	type: 'image',
	mime: 'image/png',
	publicPath: '/api/social/assets/teacher/image/asset_original.png'
};
const record = {
	id: 'post_source',
	contentType: 'post',
	aliasId: 'teacher',
	heichelId: 'study',
	seriesId: 'root',
	title: 'Source with media',
	options: { rootDocument: { version: 1, blocks: [] } },
	rootAssets: [media],
	sections: [{
		id: 'verse_old',
		title: 'Verse',
		assets: [media],
		segments: [{ id: 'sub_old', label: 'Sub', assets: [media] }]
	}]
};
const mapped = mapCloneRecord(record, {
	type: 'post',
	id: 'post_source',
	heichelId: 'study',
	seriesId: 'root',
	aliasId: 'teacher'
});
const values = [
	mapped.rootAttachments[0],
	mapped.sections[0].attachments[0],
	mapped.sections[0].subsections[0].attachments[0]
];
for (const item of values) {
	assert.equal(item.cloneAssetSource.aliasId, 'teacher');
	assert.equal(item.cloneAssetSource.assetId, 'asset_original');
	assert.equal(item.ownershipState, 'source');
	assert.notEqual(item.id, 'asset_original');
}
assert.equal(new Set(values.map(item => item.id)).size, 3);
console.log('B"H CloneMediaMapper.test passed');
