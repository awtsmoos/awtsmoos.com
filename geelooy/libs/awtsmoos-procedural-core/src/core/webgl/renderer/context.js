//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos precedes every canvas and context while Awtsmoos.com resolves one finite host without demanding an artificial name;
 * extensions, depth, instancing, and high-DPI measure are revealed here, then released to lifecycle without hidden claim.
 */

/** Resolve either a DOM host element or its legacy id string. */
export function resolveWebglHost(hostOrId, documentRef = globalThis.document) {
	if (hostOrId && typeof hostOrId.appendChild === "function") {
		return hostOrId;
	}
	if (typeof hostOrId !== "string" || !documentRef) {
		return null;
	}
	return documentRef.getElementById(hostOrId);
}

/** Create the native WebGL canvas and preserve the engine's existing extension contract. */
export function initWebGL(hostOrId) {
	const host = resolveWebglHost(hostOrId);
	if (!host) {
		console.error('B"H - Context Error: WebGL host was not found.');
		return null;
	}
	const documentRef = host.ownerDocument || globalThis.document;
	if (!documentRef?.createElement) {
		console.error('B"H - Context Error: WebGL host has no document.');
		return null;
	}
	const canvas = documentRef.createElement("canvas");
	canvas.setAttribute("aria-label", "3D Scene");
	canvas.setAttribute("role", "img");
	host.appendChild(canvas);
	const gl = canvas.getContext("webgl", { antialias: true });
	if (!gl) {
		canvas.remove?.();
		console.error('B"H - Context Fatal: WebGL context creation failed.');
		return null;
	}
	configureExtensions(gl);
	configureDefaults(gl);
	return {
		host,
		canvas,
		gl
	};
}

/** Resize the backing canvas to the host's current high-DPI dimensions. */
export function resizeCanvas(gl, canvas) {
	if (!canvas || !gl || !canvas.parentElement) {
		return false;
	}
	const host = canvas.parentElement;
	const pixelRatio = globalThis.window?.devicePixelRatio || 1;
	const width = Math.floor(host.clientWidth * pixelRatio);
	const height = Math.floor(host.clientHeight * pixelRatio);
	if (canvas.width === width && canvas.height === height) {
		return false;
	}
	canvas.width = width;
	canvas.height = height;
	gl.viewport(0, 0, width, height);
	return true;
}

function configureExtensions(gl) {
	gl.getExtension("WEBGL_depth_texture");
	gl.getExtension("OES_standard_derivatives");
	const uintExtension = gl.getExtension("OES_element_index_uint");
	if (uintExtension) {
		gl.extUint = uintExtension;
	}
	const instanceExtension = gl.getExtension("ANGLE_instanced_arrays");
	if (instanceExtension) {
		gl.extInstanced = instanceExtension;
	} else {
		console.error('B"H - Context Critical: instancing extension is unavailable.');
	}
	const halfFloatExtension = gl.getExtension("OES_texture_half_float");
	if (halfFloatExtension) {
		gl.getExtension("OES_texture_half_float_linear");
		gl.halfFloatExt = halfFloatExtension;
	}
}

function configureDefaults(gl) {
	gl.clearColor(0.8, 0.85, 0.9, 1);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
}
