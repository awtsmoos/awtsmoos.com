// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DirectWorldContextAction.js
 * @description Resolves many contextual-action providers into one truthful direct-play deed by explicit priority.
 * The Awtsmoos contains every possible action without crowding the traveler with every button; Awtsmoos.com lets
 * Build, Talk, Begin, Return, Learn, Collect, Open, and future providers compete through one tiny stable contract.
 */

import { HIDDEN_DIRECT_ACTION } from './DirectWorldContextActionState.js';
import { DirectWorldContextQuestAction } from './DirectWorldContextQuestAction.js';

/** Generic direct-world resolver; external providers live in runtime.contextActionProviders. */
export class DirectWorldContextAction {
	/** @param {object} runtime Staged MitzvahWorld runtime. */
	constructor(runtime) {
		this.runtime = runtime;
		this.questProvider = new DirectWorldContextQuestAction(runtime);
	}

	/** Returns the highest-priority visible provider state. */
	state() {
		return this.resolve()?.state || HIDDEN_DIRECT_ACTION;
	}

	/** Activates the same provider/state pair used for presentation. */
	activate() {
		const resolved = this.resolve();
		return resolved?.provider?.activate?.(resolved.state) ?? false;
	}

	/** Releases only providers owned by this resolver. */
	destroy() {
		this.questProvider.destroy();
	}

	/** Finds the first visible provider after deterministic priority ordering. */
	resolve() {
		for (const provider of this.providers()) {
			const state = provider?.state?.() || HIDDEN_DIRECT_ACTION;
			if (state.visible && state.enabled !== false) {
				return Object.freeze({ provider, state });
			}
		}
		return null;
	}

	/** Returns external contextual providers plus the dedicated quest fallback. */
	providers() {
		return [
			...(this.runtime.contextActionProviders || []),
			this.questProvider
		].filter(Boolean).sort((left, right) => {
			return Number(right.priority || 0) - Number(left.priority || 0);
		});
	}
}
