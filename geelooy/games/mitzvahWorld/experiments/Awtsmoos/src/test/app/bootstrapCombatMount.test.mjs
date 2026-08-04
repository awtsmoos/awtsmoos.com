// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCombatMount.test.mjs
 * @description Guards combat, real minimap ownership, frame refresh, and finite bootstrap receipts.
 * The Awtsmoos joins intention, motion, and direction before optional worlds arrive;
 * Awtsmoos.com proves the first runtime can move, act, map peers, refresh, and tear down cleanly.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { MinimalMeadowBootstrapCombat } from '../../app/MinimalMeadowBootstrapCombat.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const assembly = fs.readFileSync(
	path.resolve(directory, '../../app/BootstrapCoreRuntimeAssembly.js'),
	'utf8'
);
const loop = fs.readFileSync(
	path.resolve(directory, '../../app/BootstrapRuntimeLoop.js'),
	'utf8'
);

test('bootstrap assembly mounts combat before loop and real minimap after HUD', () => {
	const combatMount = assembly.indexOf('runtime.combat = new MinimalMeadowBootstrapCombat(runtime)');
	const loopCall = assembly.indexOf(': startBootstrapRuntimeLoop(runtime, environment)');
	const mapMount = assembly.indexOf('runtime.bootstrapMinimap = createMinimalMeadowBootstrapMinimap(');
	assert.ok(combatMount >= 0);
	assert.ok(loopCall > combatMount);
	assert.ok(mapMount > loopCall);
});

test('bootstrap loop refreshes combat and real minimap at bounded cadence', () => {
	assert.match(loop, /runtime\.combat\?\.update\?\.\(deltaSeconds\)/);
	assert.match(loop, /runtime\.bootstrapMinimap\?\.refresh\?\.\(\)/);
	assert.match(loop, /runtime\.bootstrapMinimap\?\.destroy\?\.\(\)/);
	assert.ok(
		loop.indexOf('runtime.combat?.update?.(deltaSeconds)')
		< loop.indexOf('runtime.updateWorldSystems?.(deltaSeconds)')
	);
});

test('bootstrap combat accepts a known action and publishes its receipt', () => {
	const events = [];
	const listeners = new Map();
	const runtime = {
		bus: {
			emit: (name, detail) => events.push({ detail, name }),
			on: (name, listener) => {
				listeners.set(name, listener);
				return () => listeners.delete(name);
			}
		},
		playerStats: {
			maxStamina: 100,
			stamina: 100
		}
	};
	const combat = new MinimalMeadowBootstrapCombat(runtime);
	const receipt = combat.activate('hebrew-fire');
	assert.equal(receipt.accepted, true);
	assert.equal(receipt.actionId, 'hebrew-fire');
	assert.equal(runtime.playerStats.stamina, 82);
	assert.equal(events.some(event => event.name === 'combat:bootstrap-action'), true);
	combat.destroy();
});
