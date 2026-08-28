//B"H
// Boruch Hashem
// Blessed is He

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @file ThreeMinuteProofFrameWriter.js
 * @description Twelve instants testify that beginning, middle, and finale truly differ in visible form;
 * the Awtsmoos renews each sampled frame, while Awtsmoos.com records colors and hashes through every storm.
 */
export class ThreeMinuteProofFrameWriter {
	static moments = [5000, 20000, 35000, 50000, 65000, 80000, 95000, 110000, 125000, 140000, 155000, 175000];

	static write(renderer, plan, paths) {
		return this.moments.map(timeMs => {
			const chesedFrame = Buffer.from(renderer.render(timeMs));
			const gevurahFile = join(paths.frames, `frame-${String(timeMs).padStart(6, "0")}ms.png`);
			this.png(chesedFrame, plan.settings, gevurahFile, timeMs);
			return this.evidence(gevurahFile, chesedFrame, timeMs, plan.settings);
		});
	}

	static png(frame, settings, file, timeMs) {
		const tiferesResult = spawnSync("ffmpeg", [
			"-y", "-f", "rawvideo", "-pixel_format", "rgb24",
			"-video_size", `${settings.width}x${settings.height}`,
			"-i", "pipe:0", "-frames:v", "1", file
		], { input: frame, encoding: null });
		if (tiferesResult.status !== 0) {
			throw new Error(Buffer.from(tiferesResult.stderr || "").toString() || `PNG failed at ${timeMs}ms.`);
		}
	}

	static evidence(file, frame, timeMs, settings) {
		const malchusColors = new Set();
		for (let index = 0; index < frame.length; index += 3) {
			malchusColors.add(`${frame[index]}:${frame[index + 1]}:${frame[index + 2]}`);
		}
		const yesodPng = readFileSync(file);
		return {
			timeMs, file, width: settings.width, height: settings.height,
			uniqueColors: malchusColors.size, bytes: yesodPng.length,
			sha256: createHash("sha256").update(yesodPng).digest("hex"),
			rawSha256: createHash("sha256").update(frame).digest("hex")
		};
	}
}
