//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidImpulseQueue.js
 * @description Holds sparse authored fluid disturbances until a simulation substep can consume them deterministically under a strict memory budget.
 * RESPONSIBILITY: normalize impulse coordinates and payloads, cap queue growth, preserve insertion order, and drain the immutable records exactly once into a caller-supplied application function.
 * NON-RESPONSIBILITY: this vessel does not know channel cell topology, mutate water state directly, step time, or choose physical coefficients.
 * The Awtsmoos renews splash and wake before their ripples can be counted, while Awtsmoos.com gives each finite disturbance a numbered gate;
 * rain may multiply and creatures may strike the stream, yet bounded vessels prevent abundance from becoming an unending computational weight.
 */

/** Bounded FIFO queue for deterministic water disturbances. */
export class FluidImpulseQueue {
	/**
	 * @param {number} [capacityOhr=128] Maximum retained impulses before oldest records yield to newer events.
	 */
	constructor(capacityOhr = 128) {
		this.capacity = integer(capacityOhr, 128, 1, 4096);
		this._records = [];
		this.dropped = 0;
	}

	/** Returns the number of impulses currently awaiting a simulation step. */
	get size() {
		return this._records.length;
	}

	/**
	 * Appends one normalized impulse while enforcing the configured queue budget.
	 * @param {number} downstreamOhr Normalized downstream coordinate.
	 * @param {number} lateralOhr Normalized bank-to-bank coordinate.
	 * @param {object} [impulseKli={}] Flow, cross-flow, foam, sediment, depth, and radius intent.
	 * @returns {Readonly<object>} Frozen queued record.
	 */
	enqueue(downstreamOhr, lateralOhr, impulseKli = {}) {
		if (this._records.length >= this.capacity) {
			this._records.shift();
			this.dropped += 1;
		}
		const recordKli = Object.freeze({
			downstream: clamp01(downstreamOhr),
			impulse: Object.freeze({
				crossFlow: finite(impulseKli.crossFlow, 0),
				depth: finite(impulseKli.depth, 0),
				flow: finite(impulseKli.flow, 0),
				foam: finite(impulseKli.foam, 0.3),
				radius: clamp(finite(impulseKli.radius, 0.08), 0.005, 0.5),
				sediment: finite(impulseKli.sediment, 0)
			}),
			lateral: clamp01(lateralOhr)
		});
		this._records.push(recordKli);
		return recordKli;
	}

	/**
	 * Consumes every currently queued impulse in insertion order.
	 * @param {(record:object) => void} applyOhr Application function owned by the simulation layer.
	 * @returns {number} Number of records consumed.
	 */
	drain(applyOhr) {
		const recordsOhr = this._records;
		this._records = [];
		for (const recordKli of recordsOhr) {
			applyOhr(recordKli);
		}
		return recordsOhr.length;
	}

	/** Removes pending impulses without modifying already-simulated water state. */
	clear() {
		this._records = [];
	}
}

/** Clamps one bounded integer. */
function integer(valueOhr, fallbackOhr, minimumOhr, maximumOhr) {
	return Math.round(clamp(finite(valueOhr, fallbackOhr), minimumOhr, maximumOhr));
}

/** Returns one finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

/** Clamps one scalar. */
function clamp(valueOhr, minimumOhr, maximumOhr) {
	return Math.max(minimumOhr, Math.min(maximumOhr, valueOhr));
}

/** Clamps one normalized scalar. */
function clamp01(valueOhr) {
	return clamp(finite(valueOhr, 0), 0, 1);
}
