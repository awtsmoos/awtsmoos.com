//B"H
//Boruch Hashem
//Blessed is He

/**
 * Freezes provider success and failure testimony. The Awtsmoos recreates request
 * sequence, phase, signature, and component vessel anew; Awtsmoos.com binds each
 * immutable ledger ID to the awaited lifecycle interval that produced it.
 */
export function createProviderLifecycleEvidence(input) {
	const {
		phases,
		provider,
		providerInfo,
		providerReference,
		result,
		runtime,
		sequenceStart
	} = input;
	const sequenceEnd = runtime.networkTrace.sequence;
	const entries = entriesInRange(runtime, sequenceStart, sequenceEnd);
	return Object.freeze({
		declarationIndex: provider.declarationIndex,
		descriptor: provider.descriptor,
		firebaseServices: Object.freeze(entries.map(entry => entry.firebaseService)),
		initOrder: provider.initOrder,
		name: provider.name,
		networkRequestIds: Object.freeze(entries.map(entry => entry.requestId)),
		networkSequenceEnd: sequenceEnd,
		networkSequenceStart: sequenceStart,
		phases: Object.freeze([...phases]),
		providerInfo,
		providerReference,
		result
	});
}

export function attachProviderLifecycleFailure(input) {
	const {
		error,
		phase,
		provider,
		runtime,
		sequenceStart,
		signature
	} = input;
	error.androidProvider = Object.freeze({
		declarationIndex: provider.declarationIndex,
		descriptor: provider.descriptor,
		initOrder: provider.initOrder,
		name: provider.name,
		networkSequenceCurrent: runtime.networkTrace.sequence,
		networkSequenceStart: sequenceStart,
		phase,
		signature
	});
	return error;
}

function entriesInRange(runtime, start, end) {
	return runtime.networkTrace.snapshot().filter(entry => {
		return entry.requestId > start && entry.requestId <= end;
	});
}
