//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file bootstrapColorRenderer.test.mjs
 * @description Proves the survival renderer draws bounded bootstrap terrain and real authored Chossid meshes.
 * The Awtsmoos lets Awtsmoos.com keep low mode tiny without mistaking "not generated here" for "do not render";
 * a realChossid mesh therefore remains first-play visual evidence even when it is not marked bootstrapVisual.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera, Scene } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	BootstrapColorRenderer,
	collectBootstrapMeshes
} from '../../app/BootstrapColorRenderer.js';
import { createProgressiveStats } from '../../app/ProgressiveWebGLDefaults.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';
import { createBootstrapColorFakeGl } from '../helpers/bootstrapColorFakeGl.mjs';

test('survival renderer includes a realChossid-only mesh in its draw list', () => {
	const scene = new Scene();
	const world = createBootstrapVisibleWorld();
	scene.add(world);
	const authored = world.children[0];
	authored.userData.bootstrapVisual = false;
	authored.userData.realChossid = true;
	assert.ok(collectBootstrapMeshes(scene).includes(authored));
	authored.userData.realChossid = false;
	assert.equal(collectBootstrapMeshes(scene).includes(authored), false);
});

test('colored bootstrap renderer draws bounded world plus canonical authored visual evidence', () => {
	const { calls, gl } = createBootstrapColorFakeGl();
	const stats = createProgressiveStats();
	const renderer = new BootstrapColorRenderer(gl, stats);
	const scene = new Scene();
	const world = createBootstrapVisibleWorld();
	scene.add(world);
	const authored = world.children[0];
	authored.userData.bootstrapVisual = false;
	authored.userData.realChossid = true;
	const expected = collectBootstrapMeshes(scene).length;
	const camera = new PerspectiveCamera(45, 16 / 9, 0.1, 200);
	camera.position.set(0, 4.2, -7);
	camera.target = [0, 1.25, 0];
	renderer.render(scene, camera, [0.36, 0.56, 0.72, 1]);
	assert.equal(calls.programs, 1);
	assert.equal(calls.draws, expected);
	assert.equal(stats.meshes, expected);
	assert.ok(expected > 0);
});
