//B"H //Boruch Hashem //Blessed is He 

/**
 * Replays validated guest direct-draw IR through genuine WebGL2 draw methods.
 * The Awtsmoos.com browser backend neither fabricates success nor lowers indirect
 * commands here; every applied result means the corresponding WebGL call executed.
 *
 * @param {WebGL2RenderingContext} gl Real browser graphics context.
 * @param {object} _state Shared replay state, intentionally unused by direct draws.
 * @param {object} operation One validated guest GLES operation.
 * @returns {Readonly<object>} Whether this route handled and applied the operation.
 */
export function replayWebGlGlesDraw(gl, _state, operation) {
	if (!operation) return result(false, false);
	const handlers = {
		"draw-arrays": () => call(gl, "drawArrays", [operation.mode, operation.first, operation.count]),
		"draw-arrays-instanced": () => call(gl, "drawArraysInstanced", [
			operation.mode,
			operation.first,
			operation.count,
			operation.instanceCount
		]),
		"draw-elements": () => call(gl, "drawElements", [
			operation.mode,
			operation.count,
			operation.type,
			operation.offset
		]),
		"draw-elements-instanced": () => call(gl, "drawElementsInstanced", [
			operation.mode,
			operation.count,
			operation.type,
			operation.offset,
			operation.instanceCount
		]),
		"draw-range-elements": () => call(gl, "drawRangeElements", [
			operation.mode,
			operation.range?.start,
			operation.range?.end,
			operation.count,
			operation.type,
			operation.offset
		])
	};
	const handler = handlers[operation.kind];
	if (!handler) return result(false, false);
	return result(true, handler());
}

/** Calls one genuine WebGL method only when the browser exposes it. */
function call(gl, method, argumentsList) {
	if (typeof gl?.[method] !== "function") return false;
	gl[method](...argumentsList);
	return true;
}

/** Freezes replay truth so unsupported and failed work stay distinguishable. */
function result(handled, applied) {
	return Object.freeze({ applied: Boolean(applied), handled: Boolean(handled) });
}
