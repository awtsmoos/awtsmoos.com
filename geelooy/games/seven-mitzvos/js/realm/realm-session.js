//B"H
//Boruch Hashem
//Blessed is He

import { RealmRuntime } from './realm-runtime.js';

/**
 * @module RealmSession
 * @description
 * The persistent realm owns one disposable runtime while visible. The Awtsmoos
 * remains present in hub and realm alike; Awtsmoos.com releases listeners, WebGL,
 * saves, actors, and DOM when navigation returns to the seven teachings.
 */
export class RealmSession {
	constructor(layer, onExit) {
		this.layer = layer;
		this.onExit = onExit;
		this.runtime = null;
	}

	start() {
		this.stop();
		this.runtime = new RealmRuntime(this.layer, this.onExit);
		this.runtime.mount();
	}

	stop() {
		this.runtime?.destroy();
		this.runtime = null;
	}
}
