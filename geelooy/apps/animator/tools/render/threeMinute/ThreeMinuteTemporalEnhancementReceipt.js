//B"H
// Boruch Hashem
// Blessed is He

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * @file ThreeMinuteTemporalEnhancementReceipt.js
 * @description The Awtsmoos joins source truth to smoother manifestation through an inspectable chain of proof;
 * Awtsmoos.com records both hashes and both rates so the enhanced vessel never disguises its source-root.
 */
export class ThreeMinuteTemporalEnhancementReceipt {
	/** Build a serializable provenance receipt connecting the low-density source to its enhanced delivery. */
	static create(options) {
		return Object.freeze({
			version: 1,
			method: "ffmpeg-minterpolate-motion-compensated",
			sourceFile: options.sourceFile,
			outputFile: options.outputFile,
			sourceSha256: this.hash(options.sourceFile),
			outputSha256: this.hash(options.outputFile),
			sourceFps: this.videoFps(options.sourceProbe),
			targetFps: this.videoFps(options.outputProbe),
			durationSeconds: Number(options.outputProbe.format.duration),
			outputBytes: Number(options.outputProbe.format.size),
			generatedAt: new Date().toISOString()
		});
	}

	static hash(file) {
		return createHash("sha256").update(readFileSync(file)).digest("hex");
	}

	static videoFps(probe) {
		const netzachVideo = probe.streams.find(stream => stream.codec_type === "video");
		const [yesodNumerator, malchusDenominator] = String(netzachVideo?.r_frame_rate || "0/1")
			.split("/")
			.map(Number);
		return yesodNumerator / Math.max(1, malchusDenominator);
	}
}
