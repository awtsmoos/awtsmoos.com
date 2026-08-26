// B"H
// Boruch Hashem
// Blessed is He

import { DialoguePerformanceSampler } from '../../performance/dialogue/DialoguePerformanceSampler.js';

/**
 * @file StudioPerformanceWorkflow.js
 * @description
 * The Awtsmoos renews an acting draft before it becomes a visible performance proof;
 * Awtsmoos.com keeps experimentation transient, deterministic, and separate from authored project truth.
 */
export class StudioPerformanceWorkflow {
	/** @returns {object} Friendly performance defaults shared by first render and reset-free editing. */
	static defaults() {
		return {
			speech: 'We found it. Look over there!',
			emotion: 'joy',
			speechStyle: 'normal',
			duration: 2.4,
			energy: 1,
			samples: 24
		};
	}

	/** @param {object} state Studio state. @returns {object} Complete current draft. */
	static draft(state) {
		return {
			...this.defaults(),
			...(state?.studioPerformanceDraft || {})
		};
	}

	/** @param {object} store Studio store. @param {string} field Draft field. @param {*} rawValue UI value. */
	static update(store, field, rawValue) {
		const allowed = new Set(['speech', 'emotion', 'speechStyle', 'duration', 'energy', 'samples']);
		if (!allowed.has(field)) {
			throw new Error(`Unknown performance field: ${field}`);
		}
		const current = this.draft(store.get());
		store.set({
			studioPerformanceDraft: {
				...current,
				[field]: this.value(field, rawValue)
			},
			studioPerformancePreview: null
		});
	}

	/** @param {object} store Studio store. @returns {object} Deterministic performance preview installed into transient state. */
	static sample(store) {
		const input = this.draft(store.get());
		const preview = DialoguePerformanceSampler.sample(input);
		store.set({ studioPerformancePreview: preview });
		return preview;
	}

	/** @param {string} field Draft field. @param {*} rawValue Candidate value. @returns {*} Typed field value. */
	static value(field, rawValue) {
		if (field === 'speech' || field === 'emotion' || field === 'speechStyle') {
			return String(rawValue || '');
		}
		const fallback = this.defaults()[field];
		const numeric = Number(rawValue);
		return Number.isFinite(numeric) ? numeric : fallback;
	}
}
