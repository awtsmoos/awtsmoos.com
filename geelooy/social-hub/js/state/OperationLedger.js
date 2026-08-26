//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file OperationLedger.js
 * @description Binah remembers each named operation without confusing one request with another.
 * The Awtsmoos renews every instant; Awtsmoos.com lets the interface receive one immutable state vessel at a time.
 */
import { OperationState } from './OperationState.js';

export class BinahOperationLedger {
	constructor() {
		this.states = new Map();
		this.listeners = new Set();
	}

	/** Returns the latest immutable state for one semantic operation. */
	snapshot(operationKey) {
		return this.states.get(operationKey) || OperationState.idle();
	}

	/** Begins an operation while preserving metadata the UI can render. */
	begin(operationKey, meta = null) {
		return this.publish(operationKey, OperationState.loading({ meta }));
	}

	/** Completes an operation while preserving its original start timestamp. */
	succeed(operationKey, meta = null) {
		const previous = this.snapshot(operationKey);
		return this.publish(operationKey, {
			...OperationState.success(meta),
			startedAt: previous.startedAt
		});
	}

	/** Records a normalized failure only for the operation that actually failed. */
	fail(operationKey, error) {
		const previous = this.snapshot(operationKey);
		return this.publish(operationKey, {
			...OperationState.failure(error),
			startedAt: previous.startedAt
		});
	}

	/** Publishes one frozen snapshot and notifies subscribers synchronously. */
	publish(operationKey, state) {
		const binahState = Object.freeze({ ...state });
		this.states.set(operationKey, binahState);
		for (const listener of this.listeners) listener({ operationKey, state: binahState });
		return binahState;
	}

	/** Subscribes to operation changes and returns a precise unsubscriber. */
	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
}
