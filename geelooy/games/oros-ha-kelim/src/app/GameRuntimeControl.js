//B"H
//Boruch Hashem
//Blessed is He

import { ReplayJournal } from "../runtime/ReplayJournal.js";
import { QualityProfile } from "../settings/QualityProfile.js";

/**
 * GameRuntimeControl owns deterministic stepping, replay memory and live preference application.
 * The Awtsmoos renews command-time beyond ordinary frames while simulation law remains one;
 * Awtsmoos.com lets tooling enter Yesod without exposing mutable roots or inventing a second run.
 */
export class GameRuntimeControl {
	constructor(game) {
		this.game = game;
		this.journal = new ReplayJournal();
	}

	consumeIntent() {
		const intent = this.game.intent.consume();
		this.journal.record(this.game.match.tick + 1, intent);
		return intent;
	}

	stepPaused(count = 1) {
		if (!this.game.started || !this.game.paused) {
			throw new Error("Runtime stepping requires a started, paused game");
		}
		const pulses = this.#count(count);
		const frameEvents = [];
		for (let index = 0; index < pulses && !this.game.match.ended; index += 1) {
			const events = this.game.session.step(this.consumeIntent());
			frameEvents.push(...events);
			for (const event of events) {
				this.game.events.emit(event);
			}
		}
		this.game.lastEvents = frameEvents;
		this.game.syncFrame(0, performance.now(), frameEvents);
		return this.game.snapshot();
	}

	reset() {
		this.journal.reset();
	}

	exportReplay() {
		return this.journal.export();
	}

	getPreferences() {
		return this.game.preferences.get();
	}

	setPreferences(changes) {
		if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
			throw new TypeError("preferences require an object");
		}
		const before = this.game.preferences.get();
		const next = this.game.preferences.set(changes);
		this.game.inputs.touch.setHandedness(next.handedness);
		if (before.quality !== next.quality) {
			this.game.quality = QualityProfile.fromBrowser(next);
			this.game.restart();
		}
		return { preferences: next, quality: this.game.quality };
	}

	#count(value) {
		if (!Number.isInteger(value) || value < 1 || value > 120) {
			throw new RangeError("step count must be an integer from 1 through 120");
		}
		return value;
	}
}
