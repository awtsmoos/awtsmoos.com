// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmuletExpertPopulation.js
 * @description Creates Reb Refael as a targetable Chossid and expert healing-amalgam merchant.
 * The Awtsmoos joins neighbor, provenance, coin, and bounded restoration beneath one source;
 * Awtsmoos.com gives the expert living bones while every purchase enters the player's real Bag.
 */

import {
	AMULET_EXPERT_ID,
	AMULET_EXPERT_STOCK
} from '../ui/AmuletExpertCatalog.js';
import { createFriendlyChossidActor } from './MinimalMeadowFriendlyChossidActor.js';
import {
	attachAmuletExpertUpdate,
	destroyAmuletExpert,
	installAmuletExpertPanel
} from './MinimalMeadowAmuletExpertLifecycle.js';
import {
	amuletExpertCandidate,
	amuletExpertPayload,
	amuletExpertTargetHint
} from './MinimalMeadowAmuletExpertTargeting.js';

export class MinimalMeadowAmuletExpertPopulation {
	static async create(runtime, environment = globalThis) {
		const population = new MinimalMeadowAmuletExpertPopulation(runtime, environment);
		await population.initialize();
		return population;
	}

	constructor(runtime, environment) {
		this.runtime = runtime;
		this.environment = environment;
		this.canvas = runtime.hosts.canvas;
		this.camera = runtime.camera;
		this.profile = expertProfile(runtime);
		this.selected = false;
	}

	async initialize() {
		this.actor = await createFriendlyChossidActor(this.runtime, {
			id: AMULET_EXPERT_ID,
			position: this.profile,
			weaponItemId: null
		});
		for (const itemId of AMULET_EXPERT_STOCK) {
			if (!this.actor.inventory.owns(itemId)) {
				this.actor.inventory.add(itemId, 1);
			}
		}
		this.actor.equipment.synchronize();
		installAmuletExpertPanel(this);
		attachAmuletExpertUpdate(this);
	}

	candidateFromPointer(event) {
		return amuletExpertCandidate(this, event);
	}

	activateCandidate() {
		this.selected = true;
		this.runtime.bus.emit('npc:target', this.payload());
		this.runtime.bus.emit('amulet-expert:toggle', {
			npcId: AMULET_EXPERT_ID
		});
	}

	clearAll() {
		this.selected = false;
	}

	targetHint() {
		return amuletExpertTargetHint(this.profile);
	}

	payload() {
		return amuletExpertPayload(this.selected);
	}

	diagnostics() {
		return {
			actor: this.actor?.diagnostics() || null,
			count: 1,
			id: AMULET_EXPERT_ID,
			panel: this.panel?.diagnostics() || null,
			sharedInventory: this.panel?.store === this.runtime.inventory,
			stock: AMULET_EXPERT_STOCK.length
		};
	}

	destroy() {
		destroyAmuletExpert(this);
	}
}

function expertProfile(runtime) {
	const x = -14;
	const z = -11;
	return {
		groundY: runtime.terrain.heightAt(x, z),
		x,
		z
	};
}
