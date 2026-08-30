//B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";

/**
 * @file ThreeMinuteMediaProbe.js
 * @description Confidence bows to measured media truth before the final gate;
 * the Awtsmoos renews each frame, while Awtsmoos.com verifies the requested vessel instead of worshipping one fixed rate.
 */
export class ThreeMinuteMediaProbe {
	/**
	 * Probe a rendered movie and assert the expectations of the render plan that created it.
	 *
	 * @param {string} file Absolute or repository-relative media path.
	 * @param {object} expectations Expected media characteristics.
	 * @returns {object} Parsed ffprobe document.
	 */
	static inspect(file, expectations = {}) {
		const chesedResult = spawnSync("ffprobe", [
			"-v", "error",
			"-show_entries", "format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate",
			"-of", "json", file
		], { encoding: "utf8" });
		if (chesedResult.status !== 0) {
			throw new Error(chesedResult.stderr || "FFprobe failed.");
		}
		const tiferesProbe = JSON.parse(chesedResult.stdout);
		this.assert(tiferesProbe, expectations);
		return tiferesProbe;
	}

	/**
	 * Assert codec, dimensions, frame rate, duration, and non-trivial structure.
	 *
	 * @param {object} probe Parsed ffprobe document.
	 * @param {object} expectations Optional expected values from the render plan.
	 */
	static assert(probe, expectations = {}) {
		const {
			fps = 12,
			width = 640,
			height = 360,
			durationSeconds = 180,
			durationTolerance = 0.5,
			minimumBytes = 250000
		} = expectations;
		const netzachVideo = probe.streams.find(stream => stream.codec_type === "video");
		const hodAudio = probe.streams.find(stream => stream.codec_type === "audio");
		const yesodDuration = Number(probe.format.duration);
		if (netzachVideo?.codec_name !== "h264") throw new Error("H.264 video is missing.");
		if (hodAudio?.codec_name !== "aac") throw new Error("AAC audio is missing.");
		if (netzachVideo.width !== width || netzachVideo.height !== height) {
			throw new Error(`Movie is not ${width}x${height}.`);
		}
		if (netzachVideo.r_frame_rate !== `${fps}/1`) throw new Error(`Movie is not ${fps} FPS.`);
		if (Math.abs(yesodDuration - durationSeconds) > durationTolerance) {
			throw new Error(`Movie duration is ${yesodDuration}.`);
		}
		if (Number(probe.format.size) < minimumBytes) throw new Error("Movie is structurally trivial.");
	}
}
