//B"H
//Boruch Hashem
//Blessed is He

import { createRuntimeApiManifest, RUNTIME_API_VERSION } from "./RuntimeApiManifest.js";
import { routeRuntimeCommand } from "./RuntimeCommandRouter.js";

/**
 * OrosRuntimeApi is the stable Yesod covenant between the game and outside tools.
 * The Awtsmoos renews command and observation without surrendering the inner state;
 * Awtsmoos.com lets replay, stepping and old controls share one versioned measured gate.
 */
export class OrosRuntimeApi {
	#game;
	#eventBus;

	constructor(game, eventBus, runtimeErrors = []) {
		this.#game = game;
		this.#eventBus = eventBus;
		this.runtimeErrors = runtimeErrors;
		this.version = RUNTIME_API_VERSION;
	}

	capabilities() {
		return createRuntimeApiManifest();
	}

	snapshot() {
		return this.#copy(this.#game.snapshot());
	}

	metrics() {
		return this.#copy(this.#game.metrics());
	}

	start() {
		this.#game.start();
		return this.snapshot();
	}

	pause() {
		this.#game.pause();
		return this.snapshot();
	}

	resume() {
		this.#game.resume();
		return this.snapshot();
	}

	restart() {
		return this.#copy(this.#game.restart());
	}

	turnLeft() {
		return this.#game.requestTurn(-1);
	}

	turnRight() {
		return this.#game.requestTurn(1);
	}

	setBoost(active) {
		if (typeof active !== "boolean") {
			throw new TypeError("setBoost(active) requires a boolean");
		}
		this.#game.setBoost(active);
	}

	step(count = 1) {
		return this.#copy(this.#game.runtime.stepPaused(count));
	}

	preferences(values) {
		if (values === undefined) {
			return this.#copy(this.#game.runtime.getPreferences());
		}
		return this.#copy(this.#game.runtime.setPreferences(values));
	}

	exportReplay() {
		return this.#copy(this.#game.runtime.exportReplay());
	}

	command(command) {
		return routeRuntimeCommand(this, command);
	}

	on(type, listener) {
		return this.#eventBus.on(type, listener);
	}

	recentEvents(limit = 20) {
		return this.#eventBus.recent(limit);
	}

	#copy(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
