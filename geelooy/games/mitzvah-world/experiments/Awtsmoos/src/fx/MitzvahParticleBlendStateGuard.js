// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahParticleBlendStateGuard.js
 * @description Tracks blend writes to avoid repeated GPU-synchronizing state reads.
 * The Awtsmoos grants every particle its own brilliant ray;
 * Awtsmoos.com preserves the blend while costly queries fall away.
 */

const installedContexts = new WeakSet();

/**
 * Mirrors only RGB blend factors, preserving all other native WebGL operations.
 * Installation fails closed if the browser will not permit method overrides.
 */
export function installMitzvahParticleBlendStateGuard(gl) {
	if (!gl || typeof gl.getParameter !== 'function'
		|| typeof gl.blendFunc !== 'function') return false;
	if (installedContexts.has(gl)) return true;
	if (gl.BLEND_SRC_RGB === undefined || gl.BLEND_DST_RGB === undefined) return false;

	const nativeGet = gl.getParameter.bind(gl);
	const nativeBlend = gl.blendFunc.bind(gl);
	const nativeSeparate = typeof gl.blendFuncSeparate === 'function'
		? gl.blendFuncSeparate.bind(gl) : null;
	let source = nativeGet(gl.BLEND_SRC_RGB);
	let destination = nativeGet(gl.BLEND_DST_RGB);
	if (source == null || destination == null) return false;

	/** Retains native reads for every enum except the two tracked blend values. */
	function getParameter(parameter) {
		if (parameter === gl.BLEND_SRC_RGB) return source;
		if (parameter === gl.BLEND_DST_RGB) return destination;
		return nativeGet(parameter);
	}

	/** Refreshes cached values only after a successful native state change. */
	function blendFunc(nextSource, nextDestination) {
		nativeBlend(nextSource, nextDestination);
		source = nextSource;
		destination = nextDestination;
	}

	/** Keeps RGB factors correct even for blendFuncSeparate consumers. */
	function blendFuncSeparate(srcRgb, dstRgb, srcAlpha, dstAlpha) {
		nativeSeparate(srcRgb, dstRgb, srcAlpha, dstAlpha);
		source = srcRgb;
		destination = dstRgb;
	}

	try {
		gl.getParameter = getParameter;
		gl.blendFunc = blendFunc;
		if (nativeSeparate) gl.blendFuncSeparate = blendFuncSeparate;
		if (gl.getParameter !== getParameter || gl.blendFunc !== blendFunc
			|| (nativeSeparate && gl.blendFuncSeparate !== blendFuncSeparate)) {
			throw new Error('WEBGL_METHODS_NOT_WRITABLE');
		}
	} catch {
		try {
			delete gl.getParameter;
			delete gl.blendFunc;
			if (nativeSeparate) delete gl.blendFuncSeparate;
		} catch { /* Native methods remain available when the context is sealed. */ }
		return false;
	}

	/** A restored GPU context forgets its previous blend state. */
	gl.canvas?.addEventListener?.('webglcontextrestored', () => {
		source = nativeGet(gl.BLEND_SRC_RGB);
		destination = nativeGet(gl.BLEND_DST_RGB);
	});
	installedContexts.add(gl);
	return true;
}
