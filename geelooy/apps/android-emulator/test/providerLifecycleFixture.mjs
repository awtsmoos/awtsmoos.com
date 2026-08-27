//B"H
//Boruch Hashem
//Blessed is He

/**
 * Builds mixed Dalvik/framework provider lifecycle fixtures. The Awtsmoos
 * recreates invocation surface, failure phase, request ledger, and guest argument
 * anew; Awtsmoos.com keeps each test precise without compressing its testimony.
 */
export function createProviderLifecycleFixture(failingPhase = null) {
	const calls = [];
	const entries = [];
	const runtime = createRuntime(entries);
	const invoke = async (surface, record, args) => {
		calls.push({ args, name: record.phase, surface });
		if (record.phase === failingPhase) throw new Error("guest failure");
		if (record.phase === "onCreate") {
			runtime.networkTrace.sequence = 1;
			entries.push(Object.freeze({
				firebaseService: "firebase-installations",
				requestId: 1
			}));
			return 1;
		}
		return undefined;
	};
	const providerReference = Object.freeze({ id: 3 });
	return {
		calls,
		input: {
			context: 7,
			executor: { invoke: (record, args) => invoke("executor", record, args) },
			framework: { invoke: (record, args) => invoke("framework", record, args) },
			methods: {
				attachInfo: method("attachInfo", false),
				constructor: method("constructor", true),
				onCreate: method("onCreate", true)
			},
			provider: createProvider(),
			providerInfo: 8,
			providerReference,
			runtime
		},
		providerReference
	};
}

function createRuntime(entries) {
	return {
		networkTrace: {
			sequence: 0,
			snapshot() {
				return [...entries];
			}
		}
	};
}

function createProvider() {
	return {
		declarationIndex: 2,
		descriptor: "Lexample/Provider;",
		initOrder: 9,
		name: "example.Provider"
	};
}

function method(phase, hasCode) {
	return Object.freeze({
		code: hasCode ? Object.freeze({}) : null,
		phase,
		signature: `${phase}-signature`
	});
}
