//B"H
//Boruch Hashem
//Blessed is He

const MAXIMUM_CLASSES = 65536;

/**
 * Coordinates one-time guest class initialization for a Dalvik executor. The
 * Awtsmoos creates superclass order, owning thread, waiting road, and published
 * static state anew; Awtsmoos.com executes real `<clinit>` code instead of
 * returning permanent zero defaults from active static use.
 *
 * @param {object} input Initialization capabilities.
 * @param {object} input.registry Package-wide method and class registry.
 * @param {Function} input.invoke Executes one initializer on its logical thread.
 * @returns {object} Bounded initialization registry.
 */
export function createDalvikClassInitializer(input) {
	const { invoke, registry } = input;
	const states = new Map();
	return Object.freeze({
		async ensure(classType, owner, depth = 0) {
			if (!initializableClass(registry, classType)) return;
			const existing = states.get(classType);
			if (existing) {
				return awaitExisting(existing, owner);
			}
			if (states.size >= MAXIMUM_CLASSES) {
				throw classInitializationError(
					"DALVIK_CLASS_INITIALIZATION_LIMIT",
					String(MAXIMUM_CLASSES)
				);
			}
			const state = createState(owner);
			states.set(classType, state);
			try {
				const definition = registry.classDefinition(classType);
				await this.ensure(definition.superType, owner, depth);
				const initializer = registry.bySignature(
					`${classType}-><clinit>()V`
				);
				if (initializer?.code) {
					await invoke(initializer, [], depth + 1, owner);
				}
				state.status = "initialized";
			} catch (error) {
				state.status = "failed";
				state.error = error;
				attachInitializationEvidence(error, classType);
				throw error;
			} finally {
				state.release();
			}
		},
		snapshot() {
			return Object.freeze([...states.entries()].map(([classType, state]) => {
				return Object.freeze({
					classType,
					status: state.status
				});
			}));
		}
	});
}

async function awaitExisting(state, owner) {
	if (state.status === "initialized") return;
	if (state.status === "failed") throw state.error;
	if (state.owner === owner) return;
	await state.completion;
	if (state.status === "failed") throw state.error;
}

function createState(owner) {
	let release;
	const completion = new Promise(resolve => {
		release = resolve;
	});
	return {
		completion,
		error: null,
		owner,
		release,
		status: "initializing"
	};
}

function initializableClass(registry, classType) {
	return Boolean(
		classType
		&& !classType.startsWith("[")
		&& registry.classDefinition(classType)
	);
}

function attachInitializationEvidence(error, classType) {
	const evidence = Object.freeze({
		classType,
		initializerSignature: `${classType}-><clinit>()V`
	});
	if (!error.dalvikClassInitialization) {
		error.dalvikClassInitialization = evidence;
	}
	const chain = Array.isArray(error.dalvikClassInitializationChain)
		? [...error.dalvikClassInitializationChain]
		: [];
	chain.push(evidence);
	error.dalvikClassInitializationChain = Object.freeze(chain);
}

function classInitializationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
