// B"H
// Boruch Hashem
// Blessed is He
/** One realtime vessel preserves state while bounded frame execution renews the river. */

import { createParticleGridLiquidState } from "../liquid3d/createParticleGridLiquidState.js";
import { createRealtimeLiquidProfile3d } from "./createRealtimeLiquidProfile3d.js";
import { executeRealtimeLiquidFrame3d } from "./executeRealtimeLiquidFrame3d.js";
import { createRealtimeQualityState3d } from "./updateRealtimeQuality3d.js";

function defaultClock() {
	return globalThis.performance?.now?.() ?? Date.now();
}

export class RealtimeLiquidRuntime3d {
	#state;
	#profile;
	#qualityState;
	#surface;
	#telemetry = null;
	#frameIndex = 0;
	#clock;
	#simulationOptions;
	#surfaceOptions;

	constructor(input = {}) {
		this.#state = createParticleGridLiquidState(input.state ?? input);
		this.#profile = createRealtimeLiquidProfile3d(input.profile ?? {});
		this.#qualityState = createRealtimeQualityState3d(
			this.#profile,
			input.qualityState ?? {}
		);
		this.#surface = input.surface ?? null;
		this.#clock = input.clock ?? defaultClock;
		if (typeof this.#clock !== "function") {
			throw new TypeError("Realtime liquid runtime clock must be a function.");
		}
		this.#simulationOptions = Object.freeze({
			...(input.simulationOptions ?? {})
		});
		this.#surfaceOptions = Object.freeze({
			...(input.surfaceOptions ?? {})
		});
	}

	stepFrame(frameDeltaSeconds, options = {}) {
		const result = executeRealtimeLiquidFrame3d({
			state: this.#state,
			profile: this.#profile,
			qualityState: this.#qualityState,
			surface: this.#surface,
			telemetry: this.#telemetry,
			frameIndex: this.#frameIndex,
			clock: this.#clock,
			simulationOptions: this.#simulationOptions,
			surfaceOptions: this.#surfaceOptions,
			frameDeltaSeconds,
			options
		});
		this.#state = result.state;
		this.#surface = result.surface;
		this.#telemetry = result.telemetry;
		this.#qualityState = result.qualityState;
		this.#frameIndex += 1;
		return result.snapshot;
	}

	get state() { return this.#state; }
	get profile() { return this.#profile; }
	get surface() { return this.#surface; }
	get telemetry() { return this.#telemetry; }
	get qualityState() { return this.#qualityState; }
	get frameIndex() { return this.#frameIndex; }
}
