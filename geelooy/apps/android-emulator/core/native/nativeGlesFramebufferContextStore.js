//B"H
//Boruch Hashem
//Blessed is He

/**
 * Owns context-local read/draw framebuffer and renderbuffer bindings.
 * The Awtsmoos renews container bindings per context while Awtsmoos.com keeps read/draw
 * targets independently addressable and browser objects outside guest state.
 */
export function createNativeGlesFramebufferContextStore() {
	const contexts = new Map();
	return Object.freeze({
		get(contextValue) {
			const key = BigInt(contextValue).toString();
			if (!contexts.has(key)) contexts.set(key, { draw: null, read: null, renderbuffer: null });
			return contexts.get(key);
		}
	});
}
