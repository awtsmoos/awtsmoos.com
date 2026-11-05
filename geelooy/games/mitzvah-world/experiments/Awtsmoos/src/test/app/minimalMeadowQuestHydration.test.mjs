// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowQuestHydration.test.mjs
 * @description Proves quest truth is immediate while one canonical NPC hydrates without duplication.
 * The Awtsmoos lets purpose speak before its complete messenger arrives;
 * Awtsmoos.com verifies synchronous stores, pending quality, optional waiting, reuse, and fallback recovery.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowFriendlyNpcs
} from '../../app/MinimalMeadowFriendlyNpcs.js';
import {
	mountMinimalMeadowQuest
} from '../../app/MinimalMeadowQuestMount.js';

test('B"H quest store is playable before canonical NPC hydration resolves', async () => {
	const runtime = runtimeFixture();
	let releaseHydration;
	let hydrationStarted = false;
	const receipt = mountMinimalMeadowQuest(runtime, {}, {
		hydrateMinimalMeadowQuestNpc: async () => {
			hydrationStarted = true;
			return new Promise(resolve => { releaseHydration = resolve; });
		}
	});
	assert.equal(receipt.status, 'ready');
	assert.ok(runtime.quest);
	assert.ok(runtime.questStore);
	assert.equal(runtime.quest.snapshot().status, 'available');
	assert.ok(runtime.questHydrationPromise instanceof Promise);
	await Promise.resolve();
	assert.equal(hydrationStarted, true);
	let settled = false;
	runtime.questHydrationPromise.then(() => { settled = true; });
	await Promise.resolve();
	assert.equal(settled, false);
	releaseHydration({ status: 'ready' });
	assert.deepEqual(await runtime.questHydrationPromise, { status: 'ready' });
});

test('B"H optional friendly stage reuses hydrated quest population', async () => {
	const runtime = runtimeFixture();
	let releaseHydration;
	let fallbackCalls = 0;
	runtime.questHydrationPromise = new Promise(resolve => {
		releaseHydration = () => {
			runtime.friendlyNpcs = {
				diagnostics: () => ({ canonicalQuestNpc: true })
			};
			resolve({ status: 'ready' });
		};
	});
	const installation = installMinimalMeadowFriendlyNpcs(runtime, {}, {
		installMinimalMeadowFriendlyChossids: async () => {
			fallbackCalls += 1;
			return { fallback: true };
		}
	});
	await Promise.resolve();
	assert.equal(fallbackCalls, 0);
	releaseHydration();
	assert.deepEqual(await installation, { canonicalQuestNpc: true });
	assert.equal(fallbackCalls, 0);
});

test('B"H optional friendly stage falls back only after hydration failure', async () => {
	const runtime = runtimeFixture();
	runtime.questHydrationPromise = Promise.reject(new Error('model unavailable'));
	let fallbackCalls = 0;
	const result = await installMinimalMeadowFriendlyNpcs(runtime, {}, {
		installMinimalMeadowFriendlyChossids: async () => {
			fallbackCalls += 1;
			return { fallback: true };
		}
	});
	assert.equal(fallbackCalls, 1);
	assert.deepEqual(result, { fallback: true });
});

function runtimeFixture() {
	const listeners = new Map();
	return {
		bus: {
			emit(type, detail) {
				for (const listener of listeners.get(type) || []) listener(detail);
			},
			on(type, listener) {
				const values = listeners.get(type) || new Set();
				values.add(listener);
				listeners.set(type, values);
				return () => values.delete(listener);
			}
		},
		questMountStatus: {}
	};
}
