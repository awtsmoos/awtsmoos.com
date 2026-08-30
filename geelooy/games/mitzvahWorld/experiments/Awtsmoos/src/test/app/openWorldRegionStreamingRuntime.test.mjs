//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file openWorldRegionStreamingRuntime.test.mjs
 * @description Proves physical package residency follows travel while one player coordinate and one world identity remain untouched.
 * The Awtsmoos reveals distant chambers without transporting the soul between separate worlds;
 * Awtsmoos.com verifies preload, visibility, release, bounded updates, and coordinate continuity as the open-world banner unfurls.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenWorldRegionStreamingRuntime } from '../../app/OpenWorldRegionStreamingRuntime.js';

function fixture() {
	const scene = {
		children: [],
		add(group) {
			group.parent = this;
			this.children.push(group);
		},
		remove(group) {
			this.children = this.children.filter(value => value !== group);
			group.parent = null;
		}
	};
	const events = [];
	const runtime = {
		bus: { emit: (name, payload) => events.push([name, payload]) },
		model: { position: { x: 0, y: 3, z: 0 } },
		scene
	};
	const groups = [];
	const streaming = new OpenWorldRegionStreamingRuntime(runtime, {
		factories: {
			'kedem-highlands': () => {
				const group = { parent: null, visible: false };
				groups.push(group);
				return group;
			}
		}
	});
	return { events, groups, runtime, scene, streaming };
}

test('approach preloads, arrival reveals, and departure releases without teleporting', () => {
	const { groups, runtime, scene, streaming } = fixture();
	const position = runtime.model.position;
	streaming.update(position);
	assert.equal(streaming.diagnostics().states['kedem-highlands'], 'dormant');
	Object.assign(position, { x: -40, z: 50 });
	streaming.update(position);
	assert.equal(groups.length, 1);
	assert.equal(groups[0].visible, false);
	assert.equal(scene.children.length, 1);
	Object.assign(position, { x: -112, z: 100 });
	streaming.update(position);
	assert.equal(groups[0].visible, true);
	assert.deepEqual(position, { x: -112, y: 3, z: 100 });
	Object.assign(position, { x: 800, z: 800 });
	streaming.update(position);
	assert.equal(scene.children.length, 0);
	assert.equal(streaming.diagnostics().packages.unloads, 1);
	assert.deepEqual(position, { x: 800, y: 3, z: 800 });
});

test('sub-three-unit movement does not churn package reconciliation', () => {
	const { runtime, streaming } = fixture();
	streaming.update(runtime.model.position);
	assert.equal(streaming.diagnostics().updates, 1);
	runtime.model.position.x = 1;
	streaming.update(runtime.model.position);
	assert.equal(streaming.diagnostics().updates, 1);
	runtime.model.position.x = 4;
	streaming.update(runtime.model.position);
	assert.equal(streaming.diagnostics().updates, 2);
});
