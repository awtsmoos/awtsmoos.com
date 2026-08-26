//B"H
//Boruch Hashem
//Blessed is He

import { cloneRuntimeShefa } from "./RuntimeClone.js";

/**
 * RuntimeObservationApi is the read-side Yesod: it exposes detached shefa without leaking mutable game roots.
 * The Awtsmoos renews knowing without possession; Awtsmoos.com lets diagnostics, replay, and events cross a narrow gate.
 */
export class RuntimeObservationApi {
	/**
	 * Stores orchestration references used only behind detached observation methods.
	 * @param {object} game OrosGame orchestration root.
	 * @param {object} eventBus Runtime EventBus that freezes published events.
	 */
	constructor(game, eventBus) {
		this.keliGame = game;
		this.yesodEvents = eventBus;
	}

	/**
	 * Reads the authoritative match/runtime view without exporting a live mutable reference.
	 * @returns {object} Detached authoritative snapshot.
	 */
	snapshot() {
		return cloneRuntimeShefa(this.keliGame.snapshot());
	}

	/**
	 * Reads renderer, input, and performance diagnostics as detached public shefa.
	 * @returns {object} Detached metrics payload.
	 */
	metrics() {
		return cloneRuntimeShefa(this.keliGame.metrics());
	}

	/**
	 * Reads or updates persistent experience preferences through RuntimeControl.
	 * @param {object} [values] Optional preference changes.
	 * @returns {object} Detached normalized preference state.
	 */
	preferences(values) {
		const shefa = values === undefined
			? this.keliGame.runtime.getPreferences()
			: this.keliGame.runtime.setPreferences(values);
		return cloneRuntimeShefa(shefa);
	}

	/**
	 * Exports deterministic player-intent memory without returning the live replay journal.
	 * @returns {object} Detached replay export.
	 */
	exportReplay() {
		return cloneRuntimeShefa(this.keliGame.runtime.exportReplay());
	}

	/**
	 * Subscribes an observer without granting mutation access to the inner match.
	 * @param {string} type Event type or `*` wildcard.
	 * @param {Function} listener Observer callback.
	 * @returns {Function} Unsubscribe function.
	 */
	on(type, listener) {
		return this.yesodEvents.on(type, listener);
	}

	/**
	 * Returns a detached recent event tail for diagnostics and automation.
	 * @param {number} limit Requested event count; query routing applies its own public clamp.
	 * @returns {object[]} Detached recent events.
	 */
	recentEvents(limit = 20) {
		return cloneRuntimeShefa(this.yesodEvents.recent(limit));
	}
}
