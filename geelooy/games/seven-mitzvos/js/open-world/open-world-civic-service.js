//B"H
//Boruch Hashem
//Blessed is He

import { BrowserSaveCoordinator } from '../client/living-world/browser-save-coordinator.js';
import { BrowserWorldRepository } from '../persistence/browser-world-repository.js';
import { createLivingRegionWorld } from '../world/living-region-fixture.js';
import { LivingWorldKernel } from '../world/living-world-kernel.js';
import {
	activeRegionFrom,
	activeSettlementFrom,
	civicWorldView,
	isCompatibleCivicWorld
} from './open-world-civic-view.js';
import {
	advanceWorldTimeCommand,
	constructWorldCommand
} from './open-world-world-commands.js';

const SLOT_ID = 'local';
const WORLD_SEED = 'browser-seven-regions';

/**
 * @file open-world-civic-service.js
 * @description
 * The Awtsmoos renews civic construction and explicit world time through one canonical LivingWorld kernel;
 * Awtsmoos.com keeps Farm, Sanctuary, ecology, replay, and browser persistence inside one browser authority while spatial renderers remain projections only.
 * Saves are serialized so an older worker completion can never overwrite a newer accepted world snapshot.
 */
export class OpenWorldCivicService {
	constructor() {
		this.repository = new BrowserWorldRepository();
		this.saves = new BrowserSaveCoordinator(this.repository);
		const recovered = this.saves.load(SLOT_ID);
		const state = recovered?.record?.payload?.state;
		const compatible = isCompatibleCivicWorld(state);
		this.kernel = new LivingWorldKernel(
			compatible ? state : createLivingRegionWorld(WORLD_SEED),
			{ journal: compatible ? recovered.record.payload.events : [] }
		);
		this.pendingSave = Promise.resolve();
		this.lastSaveError = '';
	}

	snapshot() {
		return this.kernel.snapshot();
	}

	activeRegion() {
		return activeRegionFrom(this.snapshot());
	}

	activeSettlement() {
		return activeSettlementFrom(this.snapshot());
	}

	/** Issues one authoritative v2 construction command and queues its canonical save. */
	construct(buildingType, parcelId) {
		const result = this.kernel.process(
			constructWorldCommand(this.snapshot(), buildingType, parcelId)
		);
		this.persist();
		return result;
	}

	buildFarm(parcelId) {
		return this.construct('farm', parcelId);
	}

	buildSanctuary(parcelId) {
		return this.construct('sanctuary', parcelId);
	}

	/** Advances canonical world simulation by explicit bounded minutes. */
	advanceTime(minutes) {
		const result = this.kernel.process(
			advanceWorldTimeCommand(this.snapshot(), minutes)
		);
		this.persist();
		return result;
	}

	advanceDay() {
		return this.advanceTime(1440);
	}

	view() {
		return civicWorldView(this.snapshot(), this.lastSaveError);
	}

	whenSaved() {
		return this.pendingSave;
	}

	/** Serializes browser saves while preserving the snapshot belonging to each accepted command. */
	persist() {
		const state = this.kernel.snapshot();
		const events = this.kernel.events();
		const previous = this.pendingSave.catch(() => {});
		this.pendingSave = previous
			.then(() => this.saves.save(SLOT_ID, state, events))
			.then(() => {
				this.lastSaveError = '';
			})
			.catch(error => {
				this.lastSaveError = error.message;
			});
	}
}
