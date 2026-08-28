//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegFrameStage.js
 * @description The Awtsmoos reveals each canonical image and lets it pass before the next descends;
 * Awtsmoos.com keeps frame-stage construction apart from export orchestration so memory, timing, and progress remain clear friends.
 */
import { NetzachCanonicalFfmpegFramePump } from './CanonicalFfmpegFramePump.js';

/**
 * Pumps every browser-rendered JPEG into one native staging session with bounded memory.
 * @param {object} orFrameSource Canonical JPEG frame source.
 * @param {object} orClient Local ffmpeg bridge client.
 * @param {string} orSessionId Server-owned session id.
 * @param {object} orProfile Render geometry and fps.
 * @param {number} orFrameCount Exact expected frame count.
 * @param {object} orOptions Progress callbacks and JPEG quality override.
 * @returns {Promise<void>} Resolves after all frame acknowledgements return.
 */
export function netzachPumpFfmpegFrames(
	orFrameSource,
	orClient,
	orSessionId,
	orProfile,
	orFrameCount,
	orOptions
) {
	const netzachPump = new NetzachCanonicalFfmpegFramePump(
		orFrameSource,
		orClient,
		orOptions
	);
	return netzachPump.pump(orSessionId, {
		width: orProfile.width,
		height: orProfile.height,
		fps: orProfile.fps,
		frameCount: orFrameCount,
		jpegQuality: Number(orOptions.jpegQuality || 0.88)
	});
}
