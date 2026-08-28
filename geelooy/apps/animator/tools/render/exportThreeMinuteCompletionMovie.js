//B"H
// Boruch Hashem
// Blessed is He

import { ThreeMinuteMovieExporter } from "./threeMinute/ThreeMinuteMovieExporter.js";

/**
 * @file exportThreeMinuteCompletionMovie.js
 * @description The Awtsmoos preserves the whole three-minute river while sampling fewer temporal vessels for practical proof;
 * Awtsmoos.com still renders every scene, camera, particle, person, overlay, and voice across the complete cinematic truth.
 */
const COMPLETION_FPS = 2;
const DURATION_SECONDS = 180;

/**
 * Render the exact existing three-minute showcase at a bounded completion sampling rate.
 *
 * The movie contract, local time, scene choreography, voices, and final duration remain unchanged.
 * Only the number of freshly rendered temporal samples is reduced from twelve per second to two.
 *
 * @returns {Promise<void>}
 */
async function revealCompletionMovie() {
	const tiferesExporter = new ThreeMinuteMovieExporter();
	tiferesExporter.plan.settings.fps = COMPLETION_FPS;
	const malchusResult = await tiferesExporter.export();
	const completionReceipt = {
		...malchusResult,
		durationSeconds: DURATION_SECONDS,
		renderSamplingFps: COMPLETION_FPS,
		renderedFrameCount: DURATION_SECONDS * COMPLETION_FPS,
		exporterFrameCount: malchusResult.frameCount
	};
	console.log(JSON.stringify(completionReceipt, null, 2));
}

revealCompletionMovie().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
