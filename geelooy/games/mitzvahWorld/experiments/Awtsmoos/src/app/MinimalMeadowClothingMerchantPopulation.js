// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowClothingMerchantPopulation.js
 * @description Creates Reb Shlomo as a canonical GLB tailor and authoritative Bag merchant.
 * The Awtsmoos joins neighbor, garment, coin, and choice beneath one living source;
 * Awtsmoos.com gives the tailor isolated bones while every purchase enters runtime.inventory.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';
import { ClothingMerchantPanel } from '../ui/ClothingMerchantPanel.js';
import { CLOTHING_MERCHANT_ID, CLOTHING_MERCHANT_NAME, CLOTHING_MERCHANT_STOCK } from '../ui/ClothingMerchantCatalog.js';
import { createFriendlyChossidActor } from './MinimalMeadowFriendlyChossidActor.js';

export class MinimalMeadowClothingMerchantPopulation {
	static async create(runtime, environment = globalThis) {
		const population = new MinimalMeadowClothingMerchantPopulation(runtime, environment);
		await population.initialize();
		return population;
	}

	constructor(runtime, environment) {
		this.runtime = runtime;
		this.environment = environment;
		this.canvas = runtime.hosts.canvas;
		this.camera = runtime.camera;
		this.profile = profile(runtime);
		this.selected = false;
	}

	async initialize() {
		this.actor = await createFriendlyChossidActor(this.runtime, {
			id: CLOTHING_MERCHANT_ID,
			position: this.profile,
			weaponItemId: null
		});
		for (const itemId of CLOTHING_MERCHANT_STOCK) {
			if (!this.actor.inventory.owns(itemId)) this.actor.inventory.add(itemId, 1);
		}
		for (const itemId of ['blue-scholar-glasses', 'velvet-top-hat', 'brown-kapote', 'linen-outer-shirt']) {
			this.actor.inventory.equip(itemId);
		}
		this.actor.equipment.synchronize();
		this.installPanel();
		this.attachUpdate();
	}

	installPanel() {
		if (!this.environment.document) return;
		this.panel = new ClothingMerchantPanel(this.runtime.inventory, {
			document: this.environment.document
		});
		this.unsubscribePanel = this.runtime.bus.on('tailor:toggle', () => this.panel.toggle());
	}

	attachUpdate() {
		this.previousUpdate = this.runtime.updateWorldSystems;
		this.updateWrapper = deltaSeconds => {
			this.previousUpdate?.(deltaSeconds);
			this.actor?.update(deltaSeconds);
		};
		this.runtime.updateWorldSystems = this.updateWrapper;
	}

	candidateFromPointer(event) {
		const hint = this.targetHint();
		if (!npcPointerHits(event, this.camera, this.canvas, hint, 1.1)) return null;
		const camera = this.camera.position;
		return { distance: Math.hypot(hint.x - camera.x, hint.y - camera.y, hint.z - camera.z), population: this, target: this };
	}

	activateCandidate() {
		this.selected = true;
		this.runtime.bus.emit('npc:target', this.payload());
		this.runtime.bus.emit('tailor:toggle', { npcId: CLOTHING_MERCHANT_ID });
	}

	clearAll() { this.selected = false; }
	targetHint() { return { x: this.profile.x, y: this.profile.groundY + 1.55, z: this.profile.z }; }
	payload() { return { face: '🧵', faction: 'friendly', health: 100, id: CLOTHING_MERCHANT_ID, maxHealth: 100, name: CLOTHING_MERCHANT_NAME, selected: this.selected, text: 'Fine garments, honest measures, and colors for a shliach.' }; }

	diagnostics() {
		return {
			actor: this.actor?.diagnostics() || null,
			count: 1,
			id: CLOTHING_MERCHANT_ID,
			panel: this.panel?.diagnostics() || null,
			sharedInventory: this.panel?.store === this.runtime.inventory,
			stock: CLOTHING_MERCHANT_STOCK.length
		};
	}

	destroy() {
		this.unsubscribePanel?.();
		this.panel?.destroy();
		this.actor?.destroy();
		if (this.runtime.updateWorldSystems === this.updateWrapper) this.runtime.updateWorldSystems = this.previousUpdate;
	}
}

function profile(runtime) {
	const x = 14;
	const z = -12;
	return { groundY: runtime.terrain.heightAt(x, z), x, z };
}
