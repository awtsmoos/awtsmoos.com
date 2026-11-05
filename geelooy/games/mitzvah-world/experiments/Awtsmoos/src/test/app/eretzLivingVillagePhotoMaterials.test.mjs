// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file eretzLivingVillagePhotoMaterials.test.mjs
 * @description Verifies five actual downloaded JPEGs and mapped structural roles.
 * The Awtsmoos calls the stone by its real grain, not by the name of a file.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {housePhotoUrl, houseMaterial} from '../../app/MinimalMeadowHouseMaterials.js';

const origin='http://127.0.0.1:8768';
const environment={location:{origin}};
const roles=['brick','brickLight','floor','mezuzah','roof','wood'];

/** Read source game JPEG bytes from the real game root, not a synthetic fixture. */
function photograph(relative) {
	const file=fileURLToPath(new URL('../../../../../'+relative,import.meta.url));
	return readFileSync(file);
}

test('each house role points to a same-origin, versioned CC0 photograph',()=>{
	const distinct=new Set();
	for(const role of roles){
		const uri=new URL(housePhotoUrl(role,environment));
		assert.equal(uri.origin,origin);
		assert.match(uri.pathname,/^\/games\/mitzvahWorld\/photoreal\/textures\/cc0\/.+\.jpg$/);
		distinct.add(uri.pathname);
		const material=houseMaterial(role);
		assert.equal(material.houseMaterialRole,role);
		assert.equal(material.textureUrl,null);
	}
	assert.equal(distinct.size,5);
});

test('five owned CC0 photos contain valid JPEG headers and meaningful payloads',()=>{
	const suffixes=['brick_4','clay_plaster','cobblestone_01','clay_roof_tiles','oak_wood_planks'];
	for(const suffix of suffixes){
		const bytes=photograph('photoreal/textures/cc0/'+suffix+'.jpg');
		assert.ok(bytes.length>120000);
		assert.deepEqual([...bytes.subarray(0,3)],[255,216,255]);
		assert.deepEqual([...bytes.subarray(-2)],[255,217]);
	}
});
