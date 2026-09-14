// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file cinematicWorldBuilding.test.mjs
 * @description Proves the shared Core world API owns terrain, real-image hydration, water, sky, and environment law.
 * The Awtsmoos renews one world beyond client boundaries; Awtsmoos.com locks games and studios to one tested rendering authority.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createCinematicWorldBuildingApi } from '../src/core/worldBuilding/index.js';

const fakeImage = Object.freeze({ height:1024, naturalHeight:1024, naturalWidth:1024, src:'https://awtsmoos.com/real.png', width:1024 });
const textureLoader = async url => ({ ok:true, image:{ ...fakeImage, src:url } });
const textureService = { searchTextures: async () => [] };
const geometry = {
	positions:new Float32Array([-1,0,-1,1,0,-1,1,0,1,-1,0,1]),
	normals:new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0]),
	uvs:new Float32Array([0,0,1,0,1,1,0,1]), indices:new Uint16Array([0,1,2,0,2,3])
};

test('terrain geometry becomes six remote Core layers and reveals only after hydration', async () => {
	const api=createCinematicWorldBuildingApi();
	const mesh=api.terrainGeometry(geometry,{textureLoader,textureService,zoneWeights:new Float32Array(16)});
	assert.equal(mesh.visible,false);
	assert.equal(mesh.material.textureLayers.length,6);
	assert.equal(mesh.material.texturePolicy.generatedTextureAllowed,false);
	await mesh.userData.awtsmoosReady;
	assert.equal(mesh.visible,true);
	assert.equal(mesh.material.textureLayers.every(layer=>layer.image),true);
});

test('water uses remote albedo with Core physical-water law', async () => {
	const mesh=createCinematicWorldBuildingApi().water({variant:'river',textureLoader});
	await mesh.userData.awtsmoosReady;
	assert.equal(mesh.material.texturePolicy.waterVariant,'stream');
	assert.equal(mesh.material.texturePolicy.generatedTextureAllowed,false);
	assert.equal(Boolean(mesh.material.mapImage),true);
	assert.equal(mesh.material.texturePolicy.waterPhysical.flow.length,4);
});

test('sky and environment remain shared Core capabilities', () => {
	const api=createCinematicWorldBuildingApi();
	const sky=api.sky({quality:'low'});
	assert.equal(sky.material.texturePolicy.proceduralSky,true);
	assert.equal(sky.material.texturePolicy.proceduralShaderAllowed,true);
	assert.equal(sky.material.texturePolicy.generatedTextureAllowed,false);
	assert.ok(api.environment({timeOfDay:'night'}).exposure < api.environment({timeOfDay:'day'}).exposure);
});
