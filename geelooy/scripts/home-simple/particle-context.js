// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos seeks the newest GPU vessel first, then descends gracefully until a living WebGL context can receive the sky.

const CONTEXT_OPTIONS = {
	alpha: true,
	antialias: false,
	desynchronized: true,
	powerPreference: "low-power",
	preserveDrawingBuffer: false
};

export function createParticleContext(canvasElement) {
	const contextNames = ["webgl2", "webgl", "experimental-webgl"];

	for (const contextName of contextNames) {
		const gl = canvasElement.getContext(contextName, CONTEXT_OPTIONS);

		if (gl) {
			return {
				gl,
				type: contextName === "experimental-webgl" ? "webgl" : contextName
			};
		}
	}

	return null;
}
