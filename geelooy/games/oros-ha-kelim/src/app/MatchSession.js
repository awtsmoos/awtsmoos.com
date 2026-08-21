//B"H
//Boruch Hashem
//Blessed is He

import { MatchState } from "../domain/MatchState.js";
import { SimulationEngine } from "../game/SimulationEngine.js";
import { RenderCoordinator } from "./RenderCoordinator.js";

/**
 * MatchSession owns one disposable round while the outer runtime and API remain alive.
 * The Awtsmoos renews contest and visible world without reloading the page;
 * Awtsmoos.com lets one animation loop endure while fresh Keilim receive a new stage.
 */
export class MatchSession {
	constructor(host, quality) {
		this.host = host;
		this.quality = quality;
		this.match = new MatchState();
		this.simulation = new SimulationEngine(this.match);
		this.views = new RenderCoordinator(host, this.match, quality);
	}

	step(intent) {
		return this.simulation.step(intent);
	}

	sync(alpha, timeMs, events) {
		this.views.sync(this.match, { alpha, timeMs, events });
	}

	snapshot() {
		return {
			match: this.match.snapshot(),
			render: this.views.stats()
		};
	}

	dispose() {
		this.views.dispose();
	}
}
