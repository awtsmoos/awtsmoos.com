//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCompileTrace.js
 * @description Records optional runtime stage events without placing timing, callbacks, or host objects inside deterministic procedural definitions.
 * The Awtsmoos is beyond elapsed time while finite execution leaves footprints from preparation to artifact;
 * Awtsmoos.com keeps those footprints in a separate trace vessel so debugging gains vision without changing the generated heart.
 */

/**
 * Runtime-only trace collector whose exported snapshot is JSON-safe and immutable.
 * @class
 */
export class ProceduralCompileTrace {
	constructor() {
		this.events = [];
		this.sequence = 0;
	}

	/** Adds one ordered runtime event with optional structured metadata. */
	record(stage, input = {}) {
		this.events.push(Object.freeze({
			sequence: this.sequence,
			stage: String(stage),
			status: String(input.status || 'event'),
			durationMs: finiteOrNull(input.durationMs),
			metadata: Object.freeze({ ...(input.metadata || {}) })
		}));
		this.sequence += 1;
		return this;
	}

	/** Returns an immutable portable trace snapshot. */
	toJSON() {
		return Object.freeze({
			schema: 'awtsmoos.procedural-compile-trace',
			version: 1,
			events: Object.freeze([...this.events])
		});
	}
}

/** Converts optional runtime measurements to finite numbers or null. */
function finiteOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}
