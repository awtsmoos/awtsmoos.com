// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCoreMechanicsFixture.mjs
 * @description Provides deterministic clock, bus, actor, and runtime vessels for core mechanics tests.
 * The Awtsmoos creates every tested instant and creature anew; Awtsmoos.com keeps
 * time, events, coordinates, enemies, movement recovery, model truth, and player resources explicit.
 */

import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import {
	coreInventoryFixture
} from './minimalMeadowCoreStateFixture.mjs';

export function coreClockFixture() {
	let milliseconds = 0;
	const environment = {
		Date,
		performance: { now: () => milliseconds }
	};
	return {
		advance(seconds) {
			milliseconds += seconds * 1000;
		},
		environment,
		now: () => milliseconds / 1000
	};
}

export function coreRuntimeFixture(options = {}) {
	const inventory = options.inventory || coreInventoryFixture();
	const runtime = {
		bus: new AwtsmoosEventBus(),
		camera: {},
		cameraRig: {},
		enemies: {
			actors: [],
			allTargets: () => []
		},
		expansion: {},
		hosts: {},
		input: {
			axis: () => ({ forward: 1, strafe: 0 })
		},
		inventory,
		inventoryStore: inventory,
		model: {
			position: {
				set(x, y, z) {
					runtime.model.position.x = x;
					runtime.model.position.y = y;
					runtime.model.position.z = z;
				}
			}
		},
		movementRecovery: {
			checkpoint() {},
			diagnostics: () => ({
				safe: { facing: 0, x: 0, y: 0, z: 0 }
			})
		},
		playerStats: {
			health: 50,
			maxHealth: 100,
			maxStamina: 100,
			stamina: 100
		},
		state: {
			facing: 0,
			grounded: true,
			renderY: 0,
			x: 0,
			y: 0,
			z: 0
		}
	};
	return Object.assign(runtime, options.runtime || {});
}

export function coreActorFixture(id, x, z, options = {}) {
	return {
		alive: options.alive !== false,
		group: {
			position: { x, y: 0, z },
			userData: {},
			visible: options.visible !== false
		},
		looted: Boolean(options.looted),
		payload: () => ({
			id,
			name: options.name || id
		}),
		profile: { id },
		serverCreatureId: id
	};
}
