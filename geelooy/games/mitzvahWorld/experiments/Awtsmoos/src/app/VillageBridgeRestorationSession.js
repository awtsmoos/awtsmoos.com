// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBridgeRestorationSession.js
 * @description Reuses Creator document/runtime transactions for one isolated persistent BRIDGE01 repair world.
 * The Awtsmoos joins document, visible geometry, collision, possession, and memory; Awtsmoos.com compensates
 * every failed persistence step and restores saved geometry without consuming another material.
 */

import { HistoryLedger } from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { MitzvahWorldCreatorDocument } from '../creator/MitzvahWorldCreatorDocument.js';
import { MitzvahWorldCreatorPersistence } from '../creator/MitzvahWorldCreatorPersistence.js';
import { MitzvahWorldCreatorRuntimeAdapter } from '../creator/MitzvahWorldCreatorRuntimeAdapter.js';
import { mitzvahWorldCreatorPart } from '../creator/MitzvahWorldCreatorCatalog.js';
import { commitCreatorPlacement, undoCreatorPlacement } from '../creator/MitzvahWorldCreatorTransactions.js';
import { creatorWorldParts } from '../creator/MitzvahWorldCreatorWorldCodec.js';
import { createVillageBridgeRestorationDefinition } from '../world/village/VillageBridgeRestorationDefinition.js';
import { BRIDGE_RESTORATION_PART_ID, BRIDGE_RESTORATION_STORAGE_KEY } from '../world/village/VillageBridgeRestorationContract.js';

/** Focused Creator transaction host for the one canonical bridge repair. */
export class VillageBridgeRestorationSession {
	constructor(runtime, inventory, environment = globalThis, dependencies = {}) {
		this.runtime = runtime;
		this.inventory = inventory;
		this.environment = environment;
		this.documentStore = dependencies.documentStore || new MitzvahWorldCreatorDocument({ environment });
		this.persistence = dependencies.persistence || new MitzvahWorldCreatorPersistence(environment, BRIDGE_RESTORATION_STORAGE_KEY);
		this.runtimeAdapter = dependencies.runtimeAdapter || new MitzvahWorldCreatorRuntimeAdapter(runtime);
		this.history = dependencies.history || new HistoryLedger();
		this.built = false;
	}

	/** Restores persistent geometry exactly once and never charges inventory. */
	restore() {
		if (this.built) return true;
		const source = this.persistence.load();
		if (!source) return false;
		this.documentStore.hydrate(source);
		const part = creatorWorldParts(this.documentStore.document)
			.find(candidate => candidate.definition.id === BRIDGE_RESTORATION_PART_ID);
		if (!part) return false;
		this.runtimeAdapter.mount(part.definition);
		this.built = true;
		return true;
	}

	/** Commits Creator placement then compensates it fully when durable save fails. */
	async build() {
		if (this.built) return Object.freeze({ alreadyBuilt: true });
		const catalog = mitzvahWorldCreatorPart('stone-platform');
		const definition = createVillageBridgeRestorationDefinition();
		const receipt = await commitCreatorPlacement(this, catalog, definition);
		const saved = this.persistence.save(this.documentStore.serialize());
		if (!saved.ok) {
			await undoCreatorPlacement(this);
			throw new Error('BRIDGE_RESTORATION_PERSISTENCE_FAILED');
		}
		this.built = true;
		return Object.freeze({ ...receipt, persistence: saved });
	}

	/** Required by the shared undo compensation path. */
	catalogPart(id) {
		return mitzvahWorldCreatorPart(id);
	}

	/** Releases live bridge-owned geometry without deleting durable truth. */
	destroy() {
		this.runtimeAdapter.clear();
	}
}
