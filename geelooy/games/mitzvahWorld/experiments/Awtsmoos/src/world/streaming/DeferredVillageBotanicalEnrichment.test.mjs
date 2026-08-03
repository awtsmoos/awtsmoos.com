// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredVillageBotanicalEnrichment.test.mjs
 * @description Proves exactly-once scheduling, fallback layering, public diagnostics, and teardown.
 * The Awtsmoos lets the procedural garden arrive before the real leaf is dressed;
 * Awtsmoos.com tests one promise and one cleanup, so no stale blossom survives the rest.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DeferredVillageBotanicalEnrichment
} from './DeferredVillageBotanicalEnrichment.js';

test('deferred enrichment installs both layers once and destroys both', async () => {
	const group = createGroup();
	let realDestroyed = false;
	const controller = new DeferredVillageBotanicalEnrichment({
		groundSampler: { heightAt: () => ({ y: 0 }) },
		group,
		loadReal: async () => ({
			async createRealNatureSystem() {
				const scene = { id: 'real' };
				group.add(scene);
				return {
					destroy() {
						realDestroyed = true;
						group.remove(scene);
					},
					snapshot() {
						return { installed: 1 };
					}
				};
			}
		}),
		loader: async () => ({
			createVillageBotanicalEnrichmentDefinitions() {
				return {
					definitions: [{ id: 'procedural' }],
					stats: { placementCount: 1 }
				};
			}
		}),
		meshFactory: definition => definition,
		quality: 'low',
		schedule(callback) {
			queueMicrotask(callback);
			return 31;
		}
	});
	const first = controller.start();
	assert.equal(controller.start(), first);
	const snapshot = await first;
	assert.equal(snapshot.state, 'complete');
	assert.equal(snapshot.installedMeshes, 1);
	assert.equal(snapshot.realNature.installed, 1);
	assert.equal(group.children.length, 2);
	controller.destroy();
	assert.equal(controller.state, 'destroyed');
	assert.equal(group.children.length, 0);
	assert.equal(realDestroyed, true);
});

test('real nature failure preserves procedural fallback', async () => {
	const controller = new DeferredVillageBotanicalEnrichment({
		groundSampler: { heightAt: () => ({ y: 0 }) },
		group: createGroup(),
		loadReal: async () => {
			throw new Error('real unavailable');
		},
		loader: async () => ({
			createVillageBotanicalEnrichmentDefinitions() {
				return { definitions: [], stats: { placementCount: 0 } };
			}
		}),
		schedule(callback) {
			queueMicrotask(callback);
			return 32;
		}
	});
	const snapshot = await controller.start();
	assert.equal(snapshot.state, 'complete-with-real-fallback');
	assert.match(snapshot.realNature.error, /real unavailable/);
	controller.destroy();
});

function createGroup() {
	return {
		children: [],
		add(child) {
			this.children.push(child);
		},
		remove(child) {
			this.children = this.children.filter(item => item !== child);
		}
	};
}
