// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stagedDeferredActorContracts.test.mjs
 * @description Proves staged production carries the canonical deferred actor interfaces before real actor hydration begins.
 * The Awtsmoos can conceal crowd and cottage culling without creating dangerous absence; Awtsmoos.com verifies
 * bootstrap assembly reuses the one placeholder authority and every mandatory rich-frame service already has a safe vessel.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createDeferredActorSystems } from '../../app/EretzDeferredActorPlaceholders.js';

test('deferred actor factory exposes every staged rich-frame contract', () => {
	const systems = createDeferredActorSystems();
	assert.equal(typeof systems.houseVisibility.update, 'function');
	assert.equal(typeof systems.lava.update, 'function');
	assert.equal(typeof systems.shadows.update, 'function');
	assert.equal(typeof systems.friendlyNpcs.update, 'function');
	assert.equal(typeof systems.hostileNpcs.update, 'function');
	assert.equal(typeof systems.horses.update, 'function');
	assert.equal(typeof systems.npc.update, 'function');
	assert.equal(typeof systems.targetCoordinator.destroy, 'function');
	assert.equal(systems.worldMode.mode, 'eretz');
	assert.equal(systems.houseVisibility.stats().status, 'streaming');
	assert.equal(systems.lava.stats().status, 'streaming');
});

test('staged bootstrap player runtime reuses the canonical deferred actor factory', () => {
	const path = fileURLToPath(new URL('../../app/BootstrapPlayerRuntime.js', import.meta.url));
	const source = fs.readFileSync(path, 'utf8');
	assert.match(source, /createDeferredActorSystems/);
	assert.match(source, /const deferredActors = createDeferredActorSystems\(\)/);
	assert.match(source, /\.\.\.deferredActors/);
	assert.doesNotMatch(source, /houseVisibility:\s*\{/);
	assert.doesNotMatch(source, /lava:\s*\{/);
	assert.doesNotMatch(source, /shadows:\s*\{/);
});
