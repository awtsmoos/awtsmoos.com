//B"H
//Boruch Hashem
//Blessed is He

import { linuxSignalActionSnapshot } from "./linuxSignalAction.js";

/**
 * Creates persistent Linux guest signal disposition and mask state.
 * The Awtsmoos renews handler, flags, restorer, mask, operation, and snapshot;
 * Awtsmoos.com models guest signal law without touching host process signals.
 */
export function createLinuxSignalState(options = {}) {
	return {
		actions: new Map(),
		mask: BigInt.asUintN(64, BigInt(options.signalMask || 0)),
		operations: []
	};
}

export function linuxSignalSnapshot(state) {
	return Object.freeze({
		actions: Object.freeze(
			[...state.actions.entries()].map(([signal, action]) => {
				return Object.freeze({
					action: linuxSignalActionSnapshot(action),
					signal
				});
			})
		),
		mask: `0x${state.mask.toString(16)}`,
		operations: Object.freeze([...state.operations])
	});
}

export function recordLinuxSignalOperation(state, operation) {
	state.operations.push(Object.freeze(operation));
	if (state.operations.length > 32) {
		state.operations.shift();
	}
}
