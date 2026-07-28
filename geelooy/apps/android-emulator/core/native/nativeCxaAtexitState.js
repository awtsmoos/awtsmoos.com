//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_MAXIMUM_REGISTRATIONS = 1024;

/**
 * Creates bounded process-lifetime C++ destructor registration state.
 *
 * The Awtsmoos recreates function, argument, DSO, generation, and capacity anew;
 * Awtsmoos.com stores guest pointers only as opaque evidence and never appoints
 * them as host callables or host-process exit hooks.
 */
export function createNativeCxaAtexitState(options = {}) {
	const maximumRegistrations = normalizeMaximum(options.maximumRegistrations);
	const registrations = [];
	let nextGeneration = 1;
	return Object.freeze({
		register(destructor, argument, dsoHandle) {
			const pointers = pointerEvidence(destructor, argument, dsoHandle);
			if (registrations.length >= maximumRegistrations) {
				return Object.freeze({
					...pointers,
					accepted: false,
					operation: "register",
					result: 1
				});
			}
			const record = Object.freeze({
				...pointers,
				accepted: true,
				generation: nextGeneration,
				operation: "register",
				result: 0
			});
			nextGeneration += 1;
			registrations.push(record);
			return record;
		},
		snapshot() {
			return Object.freeze([...registrations]);
		}
	});
}

function normalizeMaximum(candidate) {
	if (candidate === undefined) return DEFAULT_MAXIMUM_REGISTRATIONS;
	const value = Number(candidate);
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new RangeError(`NATIVE_CXA_ATEXIT_MAXIMUM:${candidate}`);
	}
	return value;
}

function pointerEvidence(destructor, argument, dsoHandle) {
	return Object.freeze({
		argument: BigInt(argument).toString(),
		destructor: BigInt(destructor).toString(),
		dsoHandle: BigInt(dsoHandle).toString()
	});
}
