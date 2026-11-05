// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosApiReceipt.js
 * @description Turns one API invocation into an immutable, timed, serializable receipt so success and failure share the same observable covenant.
 * The Awtsmoos creates the request, the passing instant, and the result anew, while Awtsmoos.com gives that event one honest Malchus record;
 * callers receive data rather than mystery, and future tracing can expand without forcing every domain to invent another response accord.
 */

import { createAwtsmoosApiSerializableValue } from './AwtsmoosApiSerializableValue.js';

let requestSerialYesod = 0;

/** Builds exactly one success/failure receipt around an operation invocation. */
export class AwtsmoosApiReceiptBuilder {
	/**
	 * Captures the operation identity and starting clocks before behavior begins.
	 * @param {string} operationOhr Stable public operation id/path.
	 * @param {object} [environmentKli=globalThis] Clock-capable environment used by tests and browsers.
	 */
	constructor(operationOhr, environmentKli = globalThis) {
		this.operation = String(operationOhr || 'api.unknown');
		this.environment = environmentKli;
		this.startedAt = wallClock(environmentKli);
		this.startedTick = monotonicClock(environmentKli);
		this.requestId = createRequestId(this.startedAt);
	}

	/**
	 * Seals a successful invocation into serializable public data.
	 * @param {*} valueOhr Arbitrary operation result; projected through the serialization boundary.
	 * @returns {Readonly<object>} Frozen success receipt.
	 */
	succeed(valueOhr) {
		return this.finish({
			ok: true,
			value: createAwtsmoosApiSerializableValue(valueOhr)
		});
	}

	/**
	 * Seals a failed invocation into a machine-readable error receipt without rethrowing implementation objects.
	 * @param {*} errorOhr Error-like value raised by the operation or policy boundary.
	 * @param {string} [codeOhr='API_OPERATION_FAILED'] Stable public error code.
	 * @returns {Readonly<object>} Frozen failure receipt.
	 */
	fail(errorOhr, codeOhr = 'API_OPERATION_FAILED') {
		const errorKli = normalizedError(errorOhr, codeOhr);
		return this.finish({
			error: errorKli,
			ok: false
		});
	}

	/**
	 * Adds common timing/request identity to one terminal receipt and freezes the public manifestation.
	 * @param {object} terminalKli Success or failure-specific fields.
	 * @returns {Readonly<object>} Frozen completed receipt.
	 */
	finish(terminalKli) {
		const completedAtOhr = wallClock(this.environment);
		const completedTickOhr = monotonicClock(this.environment);
		return Object.freeze({
			...terminalKli,
			completedAt: completedAtOhr,
			durationMs: Math.max(0, completedTickOhr - this.startedTick),
			operation: this.operation,
			requestId: this.requestId,
			startedAt: this.startedAt
		});
	}
}

/** Creates a deterministic-enough local request identity without requiring crypto or network authority. */
function createRequestId(startedAtOhr) {
	requestSerialYesod += 1;
	return `awtsmoos-api-${startedAtOhr.toString(36)}-${requestSerialYesod.toString(36)}`;
}

/** Converts an arbitrary thrown value into the stable public error keli used by failure receipts. */
function normalizedError(errorOhr, codeOhr) {
	return Object.freeze({
		code: String(errorOhr?.code || codeOhr || 'API_OPERATION_FAILED'),
		message: String(errorOhr?.message || errorOhr || 'Unknown API error.'),
		name: String(errorOhr?.name || 'Error')
	});
}

/** Reads wall time for externally meaningful request timestamps. */
function wallClock(environmentKli) {
	return Number(environmentKli?.Date?.now?.() ?? Date.now());
}

/** Reads a monotonic clock where available so duration is not corrupted by wall-clock adjustment. */
function monotonicClock(environmentKli) {
	return Number(environmentKli?.performance?.now?.() ?? wallClock(environmentKli));
}
