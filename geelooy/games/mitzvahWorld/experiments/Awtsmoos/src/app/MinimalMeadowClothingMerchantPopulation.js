// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowClothingMerchantPopulation.js
 * @description Coordinates Reb Shlomo as a targetable, receipt-backed tailor population.
 * The Awtsmoos joins neighbor, garment, coin, and choice beneath one living source;
 * Awtsmoos.com keeps population intent clear while lifecycle vessels run their course.
 */

import {
	CLOTHING_MERCHANT_ID,
	CLOTHING_MERCHANT_STOCK
} from '../ui/ClothingMerchantCatalog.js';
import {
	clothingMerchantCandidate,
	clothingMerchantPayload,
	clothingMerchantProfile
} from './MinimalMeadowClothingMerchantContract.js';
import {
	attachClothingMerchantUpdate,
	destroyClothingMerchantPopulation,
	mountClothingMerchantPanel,
	prepareClothingMerchantActor
} from './MinimalMeadowClothingMerchantLifecycle.js';

export class MinimalMeadowClothingMerchantPopulation {
	static async create(runtime, environment = globalThis) {
		const population = new MinimalMeadowClothingMerchantPopulation(
			runtime,
			environment
		);
		await population.initialize();
		return population;
	}

	constructor(runtime, environment) {
		this.runtime = runtime;
		this.environment = environment;
		this.canvas = runtime.hosts.canvas;
		this.camera = runtime.camera;
		this.profile = clothingMerchantProfile(runtime);
		this.selected = false;
	}

	async initialize() {
		await prepareClothingMerchantActor(this);
		mountClothingMerchantPanel(this);
		attachClothingMerchantUpdate(this);
	}

	candidateFromPointer(event) {
		return clothingMerchantCandidate(this, event);
	}

	activateCandidate() {
		this.selected = true;
		this.runtime.bus.emit('npc:target', this.payload());
		this.runtime.bus.emit('tailor:toggle', {
			npcId: CLOTHING_MERCHANT_ID
		});
	}

	clearAll() {
		this.selected = false;
	}

	targetHint() {
		return {
			x: this.profile.x,
			y: this.profile.groundY + 1.55,
			z: this.profile.z
		};
	}

	payload() {
		return clothingMerchantPayload(this.selected);
	}

	diagnostics() {
		return {
			actor: this.actor?.diagnostics() || null,
			count: 1,
			id: CLOTHING_MERCHANT_ID,
			merchant: this.merchant?.snapshot() || null,
			panel: this.panel?.diagnostics() || null,
			sharedInventory: this.panel?.store === this.runtime.inventory,
			stock: CLOTHING_MERCHANT_STOCK.length
		};
	}

	destroy() {
		destroyClothingMerchantPopulation(this);
	}
}
