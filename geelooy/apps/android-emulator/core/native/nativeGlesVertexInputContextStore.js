//B"H
//Boruch Hashem
//Blessed is He

/**
 * Owns generic/indexed buffer bindings and context-local vertex-array objects.
 * The Awtsmoos renews each context vessel while Awtsmoos.com keeps VAO state unshared
 * and indexed UBO/SSBO/transform-feedback roads scoped to the current GLES context.
 *
 * @returns {object} Lazy context store used by every modular vertex-input family.
 */
export function createNativeGlesVertexInputContextStore() {
	const contexts = new Map();
	return Object.freeze({
		get(contextValue) {
			const key = BigInt(contextValue).toString();
			if (!contexts.has(key)) contexts.set(key, createContextRecord());
			return contexts.get(key);
		}
	});
}

/** Creates one mutable context-local record while shared buffer objects live elsewhere. */
function createContextRecord() {
	const zero = createVertexArrayRecord(0);
	return {
		bindings: new Map(),
		currentVao: zero,
		defaultVao: zero,
		indexedBindings: new Map(),
		nextVao: 1,
		vaos: new Map()
	};
}

/** Creates one VAO record whose element binding and attributes retain real buffer records. */
export function createVertexArrayRecord(handle) {
	return { attributes: new Map(), elementBuffer: null, handle: Number(handle) };
}
