//B"H
//Boruch Hashem
//Blessed be He

/**
 * Replays generic guest render-state commands on genuine WebGL2 methods.
 * Typed clear-buffer calls rebuild the WebGL-required typed arrays explicitly;
 * all other commands preserve their traced arguments without host fabrication.
 */
export function replayWebGlGlesSimpleCommand(gl, operation) {
	if (operation?.kind !== "simple-command") {
		return Object.freeze({ applied: false, handled: false });
	}
	const method = String(operation.method || "");
	if (typeof gl[method] !== "function") {
		return Object.freeze({ applied: false, handled: true });
	}
	const args = normalizeArguments(method, operation.args || []);
	gl[method](...args);
	return Object.freeze({ applied: true, handled: true });
}

/** Converts traced clear vectors into the exact WebGL2 typed-array family. */
function normalizeArguments(method, args) {
	if (!method.startsWith("clearBuffer") || method === "clearBufferfi") return args;
	const [buffer, drawbuffer, values] = args;
	if (method === "clearBufferfv") return [buffer, drawbuffer, new Float32Array(values)];
	if (method === "clearBufferuiv") return [buffer, drawbuffer, new Uint32Array(values)];
	return [buffer, drawbuffer, new Int32Array(values)];
}
