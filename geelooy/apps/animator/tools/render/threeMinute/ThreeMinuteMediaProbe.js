//B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";

/**
 * @file ThreeMinuteMediaProbe.js
 * @description Confidence bows to measured media truth before the final gate;
 * the Awtsmoos renews each frame, while Awtsmoos.com verifies codec, dimensions, sound, size, and 180-second weight.
 */
export class ThreeMinuteMediaProbe {
	static inspect(file) {
		const chesedResult = spawnSync("ffprobe", [
			"-v", "error",
			"-show_entries", "format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate",
			"-of", "json", file
		], { encoding: "utf8" });
		if (chesedResult.status !== 0) {
			throw new Error(chesedResult.stderr || "FFprobe failed.");
		}
		const tiferesProbe = JSON.parse(chesedResult.stdout);
		this.assert(tiferesProbe);
		return tiferesProbe;
	}

	static assert(probe) {
		const netzachVideo = probe.streams.find(stream => stream.codec_type === "video");
		const hodAudio = probe.streams.find(stream => stream.codec_type === "audio");
		const yesodDuration = Number(probe.format.duration);
		if (netzachVideo?.codec_name !== "h264") { throw new Error("H.264 video is missing."); }
		if (hodAudio?.codec_name !== "aac") { throw new Error("AAC audio is missing."); }
		if (netzachVideo.width !== 640 || netzachVideo.height !== 360) { throw new Error("Movie is not 640x360."); }
		if (netzachVideo.r_frame_rate !== "12/1") { throw new Error("Movie is not 12 FPS."); }
		if (yesodDuration < 179.5 || yesodDuration > 180.5) { throw new Error(`Movie duration is ${yesodDuration}.`); }
		if (Number(probe.format.size) < 250000) { throw new Error("Movie is structurally trivial."); }
	}
}
