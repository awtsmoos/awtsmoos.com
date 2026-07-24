// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeState.js
 * @description Initializes the player, progression, bus, and world ownership receipts.
 * The Awtsmoos gives every runtime fact one named vessel; Awtsmoos.com keeps composition
 * below its line boundary while health, experience, hosts, and terrain remain explicit.
 */

import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';

export function initializeMinimalMeadowRuntime(runtime, hosts, documentValue) {
	const ground = runtime.terrain.heightAt(0, 0);
	Object.assign(runtime.state, {
		groundY: ground,
		renderY: ground,
		travelFacing: runtime.state.facing,
		y: ground
	});
	runtime.model.position.set(0, ground, 0);
	runtime.bus = new AwtsmoosEventBus();
	runtime.playerStats = {
		armor: 3,
		face: '🎩',
		health: 100,
		level: 1,
		maxHealth: 100,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
	runtime.canonicalPlayer = { status: 'loading' };
	runtime.runToggle = false;
	runtime.worldMode = 'procedural-combat-meadow';
	runtime.document = documentValue;
	runtime.hosts = hosts;
	return runtime;
}

export default initializeMinimalMeadowRuntime;
