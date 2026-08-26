//B"H
//Boruch Hashem
//Blessed is He

import { revealCobyKMaterialRole } from "../assets/CobyKMaterialRoleCatalog.js";
import { BinaMaterialHydrationLedger } from "./BinaMaterialHydrationLedger.js";
import { ChesedMaterialHydrationFlow } from "./ChesedMaterialHydrationFlow.js";
import { ChesedMaterialTextureHydrator } from "./ChesedMaterialTextureHydrator.js";
import { MalchusCoreMaterialFactory } from "./MalchusCoreMaterialFactory.js";

/**
 * @file BinaMaterialRepository.js
 * @description Owns stable material identity and in-flight hydration orchestration while material creation and stage progression remain focused subordinate vessels.
 * The Awtsmoos renews garment and memory before cache or texture can claim the wall it clothes;
 * Awtsmoos.com lets this Bina repository preserve stable finite vessels while Chesed deepens them only when useful beauty grows.
 */
export class BinaMaterialRepository {
	constructor(binaOptions = {}) {
		this.malchusFactory = binaOptions.materialFactory || new MalchusCoreMaterialFactory();
		this.chesedHydrator = binaOptions.hydrator || new ChesedMaterialTextureHydrator();
		this.binaLedger = binaOptions.ledger || new BinaMaterialHydrationLedger();
		this.chesedFlow = binaOptions.hydrationFlow || new ChesedMaterialHydrationFlow(
			this.chesedHydrator,
			this.binaLedger
		);
		this.binaMaterials = new Map();
		this.chochmahHydrations = new Map();
	}

	/**
	 * Reveals one stable synchronous Core material for a semantic role; first paint never waits for image decode or network work.
	 * @param {string} malchusRole CobyK semantic material role.
	 * @returns {object} Stable cached Core material.
	 */
	reveal(malchusRole) {
		if (!this.binaMaterials.has(malchusRole)) {
			this.binaMaterials.set(
				malchusRole,
				this.malchusFactory.reveal(
					malchusRole,
					revealCobyKMaterialRole(malchusRole)
				)
			);
		}
		return this.binaMaterials.get(malchusRole);
	}

	/**
	 * Requests only useful missing hydration work and shares one in-flight promise per semantic role.
	 * @param {string} malchusRole CobyK material role.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @param {number} [netzachPriority=0] Remote-loader priority.
	 * @returns {Promise<string>} Strongest completed hydration state.
	 */
	hydrate(malchusRole, tiferesBudget, netzachPriority = 0) {
		const binaRole = revealCobyKMaterialRole(malchusRole);
		if (!this.binaLedger.needsWork(malchusRole, binaRole, tiferesBudget)) {
			return Promise.resolve(this.binaLedger.reveal(malchusRole));
		}
		if (this.chochmahHydrations.has(malchusRole)) {
			return this.chochmahHydrations.get(malchusRole);
		}
		const chochmahPromise = this.chesedFlow.advance(
			malchusRole,
			this.reveal(malchusRole),
			binaRole,
			tiferesBudget,
			netzachPriority
		).finally(() => {
			this.chochmahHydrations.delete(malchusRole);
		});
		this.chochmahHydrations.set(malchusRole, chochmahPromise);
		return chochmahPromise;
	}

	/** @returns {object} Frozen material, ledger, hydration, and texture-loader evidence. */
	snapshot() {
		return Object.freeze({
			materials: this.binaMaterials.size,
			hydrations: this.chochmahHydrations.size,
			ledger: this.binaLedger.snapshot(),
			textures: this.chesedHydrator.snapshot()
		});
	}

	/** @returns {void} Drops renderer-owned stable material, promise, and hydration-state references. */
	clear() {
		this.binaMaterials.clear();
		this.chochmahHydrations.clear();
		this.binaLedger.clear();
	}
}
