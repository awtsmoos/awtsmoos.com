//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos knows each vessel by the strength granted to it in this instant;
 * Awtsmoos.com guards demanding cinema presets so failure becomes clear, not distant.
 */
import { getMovieOutput } from "./moviePresets.js";
export function movieCapabilityReport(outputId = "broadcast", scope = globalThis) {
	const output = getMovieOutput(outputId);
	const missing = [];
	if (typeof scope.Worker === "undefined") missing.push("Worker");
	if (typeof scope.OffscreenCanvas === "undefined") missing.push("OffscreenCanvas");
	if (typeof scope.VideoFrame === "undefined") missing.push("VideoFrame/WebCodecs");
	const deviceMemory = Number(scope.navigator?.deviceMemory || 0);
	const caution = [];
	if (output.extreme) caution.push("4K 60 fps is extremely GPU and encoder intensive.");
	else if (output.demanding) caution.push("This output is demanding on GPU and memory.");
	if (deviceMemory && deviceMemory < 8 && (output.demanding || output.extreme)) {
		caution.push(`This device reports ${deviceMemory} GB memory.`);
	}
	return Object.freeze({
		supported: missing.length === 0,
		missing: Object.freeze(missing),
		caution: Object.freeze(caution),
		output
	});
}
