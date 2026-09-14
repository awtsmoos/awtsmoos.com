//B"H
//Boruch Hashem
//Blessed be He

const STATES = new WeakMap();
const DEFAULT_VALUE = Object.freeze([0, 0, 0, 1]);

/**
 * Owns generic vertex-attribute values that are independent from VAO array
 * pointer state. Values are local to a GLES context and default to (0,0,0,1).
 */
export function getNativeGles2VertexAttribState(vertexInput) {
	if (!STATES.has(vertexInput)) {
		STATES.set(vertexInput, createState(vertexInput));
	}
	return STATES.get(vertexInput);
}

/** Creates one context-keyed generic attribute-value store. */
function createState(vertexInput) {
	const byContext = new Map();
	return Object.freeze({
		get(contextValue, index) {
			const values = byContext.get(key(contextValue));
			return Object.freeze([...(values?.get(Number(index)) || DEFAULT_VALUE)]);
		},
		set(contextValue, index, values) {
			const contextKey = key(contextValue);
			if (!byContext.has(contextKey)) byContext.set(contextKey, new Map());
			byContext.get(contextKey).set(Number(index), Object.freeze([...values]));
		},
		vertexInput
	});
}

/** Converts an EGL context handle into one stable Map key. */
function key(value) {
	return BigInt(value).toString();
}
