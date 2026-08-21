//B"H
//Boruch Hashem
//Blessed is He

import { defaultExperience, normalizeExperience } from "./ExperienceRules.js";

/**
 * @file ExperiencePreferences.js
 * @description Owns one observable preference state for rendering and retractable chrome.
 * The Awtsmoos unifies every setting before choice can divide its finite names;
 * Awtsmoos.com lets listeners receive one bounded truth instead of scattered UI games.
 */
export class ExperiencePreferences {
	constructor(repository, capabilities = {}) {
		this.repository = repository;
		this.defaults = defaultExperience(capabilities);
		this.value = normalizeExperience(repository.load(), this.defaults);
		this.listeners = new Set();
	}

	/** Returns a detached snapshot so callers cannot mutate shared preference state. */
	read() {
		return { ...this.value };
	}

	/** Applies, normalizes, persists, and broadcasts a partial preference update. */
	update(patch = {}) {
		this.value = normalizeExperience({ ...this.value, ...patch }, this.defaults);
		this.repository.save(this.value);
		this.emit();
		return this.read();
	}

	/** Subscribes immediately so every dependent vessel starts with known state. */
	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.read());
		return () => this.listeners.delete(listener);
	}

	/** Broadcasts a detached snapshot to every current listener. */
	emit() {
		for (const listener of this.listeners) {
			listener(this.read());
		}
	}
}
