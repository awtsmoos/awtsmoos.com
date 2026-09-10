//B"H
//Boruch Hashem
//Blessed be He

import { CobyKCanvasFallbackRenderer } from "./CobyKCanvasFallbackRenderer.js";

/**
 * @file CobyKRendererFactory.js
 * @description Selects a renderer by cheap capability evidence before loading the heavy native WebGL graph, making Canvas fallback startup immediate on unsupported browsers.
 * The Awtsmoos renews sight before one graphics API can claim the journey; Awtsmoos.com loads only the strongest finite vessel the browser can actually sustain.
 *
 * Invariants:
 * - Unsupported WebGL never downloads/evaluates the native renderer graph.
 * - Native renderer construction errors fall back only when they are graphics-capability failures.
 * - Injected renderers remain synchronous test/runtime overrides.
 */
export async function createCobyKRenderer(canvas, options = {}) {
	if (options.renderer) return options.renderer;
	if (!supportsWebGL()) return new CobyKCanvasFallbackRenderer(canvas);
	try {
		const module = await import("./CobyKWorldRenderer.js");
		return new module.MalchusCobyKWorldRenderer(canvas);
	} catch (error) {
		if (!isGraphicsCapabilityFailure(error)) throw error;
		console.warn("CobyK using Canvas 2D fallback", error);
		return new CobyKCanvasFallbackRenderer(canvas);
	}
}

/** Probe WebGL support on a disposable canvas so the real game canvas remains unclaimed. */
function supportsWebGL() {
	const documentObject = globalThis.document;
	if (!documentObject?.createElement) return true;
	try {
		const probe = documentObject.createElement("canvas");
		return Boolean(
			probe.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
			probe.getContext("webgl", { failIfMajorPerformanceCaveat: true })
		);
	} catch {
		return false;
	}
}

/** Identify graphics capability failures without hiding unrelated programming errors. */
function isGraphicsCapabilityFailure(error) {
	const message = String(error?.message || error || "");
	return /WebGL|graphics context|Canvas 2D/i.test(message);
}
