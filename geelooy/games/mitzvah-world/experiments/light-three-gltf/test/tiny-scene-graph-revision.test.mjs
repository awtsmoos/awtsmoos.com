// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-scene-graph-revision.test.mjs
 * @description Proves real hierarchy and visibility changes wake settled scene consumers exactly once.
 * The Awtsmoos knows every branch before and after mutation; Awtsmoos.com gives caches one stable
 * revision token so an unchanged village sleeps while new actors and hidden branches wake it.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Scene } from '../tiny-object3d.js';

test('add and remove increment only the root scene revision', () => {
	const scene = new Scene();
	const district = new Group();
	const cottage = new Group();
	assert.equal(scene._sceneGraphRevision, 0);
	scene.add(district);
	assert.equal(scene._sceneGraphRevision, 1);
	district.add(cottage);
	assert.equal(scene._sceneGraphRevision, 2);
	district.remove(cottage);
	assert.equal(scene._sceneGraphRevision, 3);
	assert.equal(district._sceneGraphRevision, 0);
});

test('visibility changes increment once while idempotent assignments stay quiet', () => {
	const scene = new Scene();
	const branch = new Group();
	scene.add(branch);
	const baseline = scene._sceneGraphRevision;
	branch.visible = true;
	assert.equal(scene._sceneGraphRevision, baseline);
	branch.visible = false;
	assert.equal(scene._sceneGraphRevision, baseline + 1);
	branch.visible = false;
	assert.equal(scene._sceneGraphRevision, baseline + 1);
	branch.visible = true;
	assert.equal(scene._sceneGraphRevision, baseline + 2);
});

test('reparenting records removal and insertion on the shared root', () => {
	const scene = new Scene();
	const first = new Group();
	const second = new Group();
	const child = new Group();
	scene.add(first);
	scene.add(second);
	first.add(child);
	const baseline = scene._sceneGraphRevision;
	second.add(child);
	assert.equal(scene._sceneGraphRevision, baseline + 2);
	assert.equal(child.parent, second);
});
