//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_MAXIMUM_REGISTRATIONS = 1024;

/**
 * Creates bounded process and thread C++ destructor registration testimony.
 * The Awtsmoos recreates function, object, DSO, thread, and generation anew;
 * Awtsmoos.com preserves guest pointers without appointing host exit callbacks.
 */
export function createNativeCxaAtexitState(options = {}) {
	const maximumRegistrations = normalizeMaximum(
		options.maximumRegistrations,
		"NATIVE_CXA_ATEXIT_MAXIMUM"
	);
	const maximumThreadRegistrations = normalizeMaximum(
		options.maximumThreadRegistrations,
		"NATIVE_CXA_THREAD_ATEXIT_MAXIMUM"
	);
	const registrations = [];
	const threadRegistrations = [];
	let nextGeneration = 1;
	return Object.freeze({
		register(destructor, argument, dsoHandle) {
			return registerRecord({
				collection: registrations,
				destructor,
				argument,
				dsoHandle,
				maximum: maximumRegistrations,
				operation: "register"
			});
		},
		registerThread(destructor, argument, dsoHandle, thread) {
			return registerRecord({
				collection: threadRegistrations,
				destructor,
				argument,
				dsoHandle,
				maximum: maximumThreadRegistrations,
				operation: "register-thread",
				thread: normalizePointer(thread)
			});
		},
		snapshot() {
			return Object.freeze([...registrations]);
		},
		threadSnapshot(thread) {
			const records = thread === undefined
				? threadRegistrations
				: threadRegistrations.filter(record => {
					return record.thread === normalizePointer(thread);
				});
			return Object.freeze([...records]);
		}
	});

	function registerRecord(detail) {
		const pointers = pointerEvidence(
			detail.destructor,
			detail.argument,
			detail.dsoHandle
		);
		const threadEvidence = detail.thread === undefined
			? Object.freeze({})
			: Object.freeze({ thread: detail.thread });
		if (detail.collection.length >= detail.maximum) {
			return Object.freeze({
				...pointers,
				...threadEvidence,
				accepted: false,
				operation: detail.operation,
				result: 1
			});
		}
		const record = Object.freeze({
			...pointers,
			...threadEvidence,
			accepted: true,
			generation: nextGeneration,
			operation: detail.operation,
			result: 0
		});
		nextGeneration += 1;
		detail.collection.push(record);
		return record;
	}
}

function normalizeMaximum(candidate, code) {
	if (candidate === undefined) return DEFAULT_MAXIMUM_REGISTRATIONS;
	const value = Number(candidate);
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new RangeError(`${code}:${candidate}`);
	}
	return value;
}

function pointerEvidence(destructor, argument, dsoHandle) {
	return Object.freeze({
		argument: normalizePointer(argument),
		destructor: normalizePointer(destructor),
		dsoHandle: normalizePointer(dsoHandle)
	});
}

function normalizePointer(value) {
	return BigInt.asUintN(64, BigInt(value)).toString();
}
