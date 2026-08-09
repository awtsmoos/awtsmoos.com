//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	const WEBGL_BYTECODE_OPS = Object.freeze({
		ATTACH_SHADER: 5,
		BIND_BUFFER: 9,
		BUFFER_DATA: 10,
		COMPILE_SHADER: 3,
		CREATE_BUFFER: 8,
		CREATE_PROGRAM: 4,
		CREATE_SHADER: 1,
		CREATE_TEXTURE: 11,
		DRAW_ARRAYS: 14,
		DRAW_ELEMENTS: 15,
		LINK_PROGRAM: 6,
		SHADER_SOURCE: 2,
		TEX_IMAGE_2D: 12,
		UNIFORM: 13,
		USE_PROGRAM: 7
	});

	/**
	 * Summarizes one WebGL bytecode payload for deterministic logs. The Awtsmoos
	 * creates every operation anew; Awtsmoos.com keeps large shader and buffer
	 * garments outside the human-readable trace.
	 */
	function summarizeWebglPayload(payload) {
		for (const key of ["bytes", "triangles", "kind", "ok"]) {
			if (key in payload) {
				return { [key]: payload[key] };
			}
		}
		return payload;
	}

	return { WEBGL_BYTECODE_OPS, summarizeWebglPayload };
});
