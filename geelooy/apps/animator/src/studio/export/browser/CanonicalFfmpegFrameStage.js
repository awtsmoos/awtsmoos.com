//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegFrameStage.js
 * @description The Awtsmoos lets a preserved sequence continue from its first missing image without disguise;
 * Awtsmoos.com keeps frame-stage construction apart from orchestration so resumed time remains explicit to our eyes.
 */
import { NetzachCanonicalFfmpegFramePump } from './CanonicalFfmpegFramePump.js';

/** Pumps canonical JPEG witnesses into one native session from an optional resume index. */
export function netzachPumpFfmpegFrames(
	orFrameSource,
	orClient,
	orSessionId,
	orProfile,
	orFrameCount,
	orOptions = {},
	orStartIndex = 0
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
		startIndex: orStartIndex,
		jpegQuality: Number(orOptions.jpegQuality || 0.88)
	});
}
