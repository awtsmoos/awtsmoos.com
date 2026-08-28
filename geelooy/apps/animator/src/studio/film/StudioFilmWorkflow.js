// B"H
// Boruch Hashem
// Blessed is He

import { ChochmahAnimatorCameraDomain } from '../../ai/agent/domain/AnimatorCameraDomain.js';
import { StudioFilmAnalysis } from './StudioFilmAnalysis.js';
import { StudioFilmCoveragePresets } from './StudioFilmCoveragePresets.js';
import { StudioFilmSceneAdapter } from './StudioFilmSceneAdapter.js';

/**
 * @file StudioFilmWorkflow.js
 * @description
 * The Awtsmoos renews coverage intention before any transient plan appears beside the canonical project;
 * Awtsmoos.com keeps Film planning read-only and detached while export remains owned by the existing Studio controller, never a rival project.
 */
export class StudioFilmWorkflow {
	/** @param {object} state Studio state. @returns {{preset:string}} Current normalized transient Film draft. */
	static draft(state = {}) {
		const yesodPreset = String(state.studioFilmDraft?.preset || 'action');
		return {
			preset: StudioFilmCoveragePresets.supports(yesodPreset)
				? yesodPreset
				: 'action'
		};
	}

	/** @param {object} store Studio store. @param {string} preset Installed coverage preset. @returns {void} */
	static updatePreset(store, preset) {
		if (!StudioFilmCoveragePresets.supports(preset)) {
			throw new Error(`Unknown Film coverage preset: ${preset}`);
		}
		store.set({
			studioFilmDraft: { preset },
			studioFilmPlan: null
		});
	}

	/**
	 * Plans six coverage beats through the canonical camera domain without mutating the project document.
	 * @param {object} store Canonical Studio store.
	 * @returns {object} Detached sequence plan and diversity summary.
	 */
	static plan(store) {
		const malchusState = store.get();
		const tiferesDraft = this.draft(malchusState);
		const yesodPlanning = StudioFilmSceneAdapter.planningState(malchusState);
		const binahEvents = StudioFilmCoveragePresets.events(
			tiferesDraft.preset,
			yesodPlanning
		);
		const chochmahPlan = new ChochmahAnimatorCameraDomain().planSequence(
			binahEvents,
			yesodPlanning,
			{}
		);
		store.set({ studioFilmPlan: chochmahPlan });
		return chochmahPlan;
	}

	/** @param {object} state Studio state. @returns {object} Current film metrics. */
	static analysis(state) {
		return StudioFilmAnalysis.summarize(state);
	}

	/** @param {object} state Studio state. @returns {object[]} Existing project camera shots. */
	static shots(state) {
		return StudioFilmSceneAdapter.shots(state);
	}
}
