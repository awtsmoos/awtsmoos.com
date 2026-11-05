// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file eretzLivingVillageVisualMount.test.mjs
 * @description Verifies real pixel texture linkage, house gating, one mount and teardown.
 * The Awtsmoos paints no pretend house when a real foundation must rise.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startEretzLivingVillageVisualMount } from '../../app/EretzLivingVillageVisualMount.js';
import { hydrateEretzLivingVillageTreeMaterials } from '../../app/EretzLivingVillageTreeMaterials.js';

function sceneFixture() {
	const bark = {name:'MeadowTreeBark',material:{}};
	const leaves = {name:'MeadowTreeLeaves',material:{}};
	const objects = [];
	const runtime = {
		scene:{traverse(fn){fn(bark);fn(leaves);},add(value){objects.push(value);}},
		terrain:{worldMetadata:{houses:[]}}
	};
	return {runtime,bark,leaves,objects};
}

test('tree bark and leaf material maps contain real RGBA pixel data', () => {
	const {runtime,bark,leaves} = sceneFixture();
	const receipt=hydrateEretzLivingVillageTreeMaterials(runtime);
	assert.equal(receipt.status,'ready');
	assert.equal(receipt.bark,1);
	assert.equal(receipt.foliage,1);
	assert.equal(bark.material.mapImage.data.length,256*256*4);
	assert.equal(leaves.material.mapImage.data.length,256*256*4);
	assert.equal(hydrateEretzLivingVillageTreeMaterials(runtime),receipt);
});

test('only actual Living Village mounts the authored architectural population', async () => {
	const {runtime,objects}=sceneFixture();
	const diagnostics={};
	let invocations=0;
	const fake={group:{traverse(fn){fn({isMesh:true});fn({isMesh:true});}},
		houses:[{profile:{id:'real-house',x:46,z:-60},roomCount:3,doors:[{},{}]}],destroy(){}};
	const dependencies={houseModule:{MinimalMeadowHousePopulation:{create(){invocations++;return fake;}}}};
	const blank=startEretzLivingVillageVisualMount(runtime,{id:'blank-meadow'},diagnostics,dependencies);
	assert.equal(blank.status,'disabled');
	assert.equal(invocations,0);
	const live=startEretzLivingVillageVisualMount(runtime,{id:'living-village'},diagnostics,dependencies);
	assert.equal(live.status,'loading');
	assert.equal(startEretzLivingVillageVisualMount(runtime,{id:'living-village'},diagnostics,dependencies),live);
	await live.promise;
	assert.equal(live.status,'ready');
	assert.equal(live.houses,1);
	assert.equal(live.meshes,2);
	assert.equal(invocations,1);
	assert.equal(objects.length,1);
	assert.equal(runtime.terrain.worldMetadata.houses[0].doors,2);
});

test('if the world ends during house loading, the population is destroyed', async () => {
	const {runtime} = sceneFixture();
	let destroyed=0;
	const fake={group:{},houses:[],destroy(){destroyed++;}};
	const visual=startEretzLivingVillageVisualMount(runtime,{id:'living-village'}, {}, {
		houseModule:{MinimalMeadowHousePopulation:{create:async()=>{runtime.destroyed=true;return fake;}}}
	});
	await visual.promise;
	assert.equal(visual.status,'destroyed');
	assert.equal(destroyed,1);
	assert.equal(runtime.housePopulation,undefined);
});
