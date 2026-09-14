//B"H
//Boruch Hashem
//Blessed be He

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
const frameExecution = fs.readFileSync(
	path.resolve(directory, '../../app/BootstrapFrameExecution.js'),
	'utf8'
);

test('bootstrap assembly feature-gates combat before loop and minimap after HUD', () => {
	const combatGate = assembly.indexOf("eretzWorldFeatureEnabled(options, 'bootstrapCombat')");
	const combatMount = assembly.indexOf('runtime.combat = new Combat(runtime)');
	const loopCall = assembly.indexOf(': startLoop(runtime, environment)');
	const mapGate = assembly.indexOf("eretzWorldFeatureEnabled(options, 'bootstrapMinimap')");
	const mapMount = assembly.indexOf('runtime.bootstrapMinimap = createMinimap(');
	assert.ok(combatGate >= 0 && combatMount > combatGate);
	assert.ok(loopCall > combatMount);
	assert.ok(mapGate > loopCall && mapMount > mapGate);
});

test('bootstrap frame execution refreshes combat and real minimap at bounded cadence', () => {
	assert.match(frameExecution, /runtime\.combat\?\.update\?\.\(deltaSeconds\)/);
	assert.match(frameExecution, /runtime\.bootstrapMinimap\?\.refresh\?\.\(\)/);
	assert.match(loop, /runtime\.bootstrapMinimap\?\.destroy\?\.\(\)/);
	assert.ok(
		frameExecution.indexOf('runtime.updateWorldSystems(deltaSeconds)')
		< frameExecution.indexOf('runtime.combat?.update?.(deltaSeconds)')
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
