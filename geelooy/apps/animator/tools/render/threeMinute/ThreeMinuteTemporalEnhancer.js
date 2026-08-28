//B"H
// Boruch Hashem
// Blessed is He

import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * @file ThreeMinuteTemporalEnhancer.js
 * @description The Awtsmoos renews motion between measured frames without hiding the source that came before;
 * Awtsmoos.com keeps the two-FPS proof intact while motion-compensated vessels reveal a smoother twelve-FPS shore.
 */
export class ThreeMinuteTemporalEnhancer {
	constructor(options = {}) {
		this.targetFps = Number(options.targetFps ?? 12);
		this.validateTarget();
	}

	/** Return the explicit motion-compensated interpolation filter used for every enhanced delivery. */
	filter() {
		return [
			`minterpolate=fps=${this.targetFps}`,
			"mi_mode=mci",
			"mc_mode=aobmc",
			"me_mode=bidir",
			"vsbmc=1"
		].join(":");
	}

	/** Build deterministic ffmpeg arguments without mutating the verified source movie. */
	arguments(sourceFile, outputFile, options = {}) {
		const chesedArguments = ["-y"];
		const gevurahStart = Number(options.startSeconds ?? 0);
		const tiferesDuration = Number(options.durationSeconds ?? 0);
		if (gevurahStart > 0) {
			chesedArguments.push("-ss", String(gevurahStart));
		}
		chesedArguments.push("-i", sourceFile);
		if (tiferesDuration > 0) {
			chesedArguments.push("-t", String(tiferesDuration));
		}
		chesedArguments.push(
			"-vf", this.filter(),
			"-r", String(this.targetFps),
			"-fps_mode", "cfr",
			"-c:v", "libx264",
			"-preset", "medium",
			"-crf", "18",
			"-pix_fmt", "yuv420p",
			"-c:a", "copy",
			"-movflags", "+faststart",
			outputFile
		);
		return chesedArguments;
	}

	/** Execute one temporal enhancement and fail with the bounded ffmpeg diagnostic when interpolation fails. */
	async enhance(sourceFile, outputFile, options = {}) {
		mkdirSync(dirname(outputFile), { recursive: true });
		const malchusProcess = spawn("ffmpeg", this.arguments(sourceFile, outputFile, options), {
			stdio: ["ignore", "ignore", "pipe"]
		});
		let yesodErrors = "";
		malchusProcess.stderr.on("data", chunk => {
			yesodErrors += chunk.toString();
		});
		const [exitCode] = await once(malchusProcess, "close");
		if (exitCode !== 0) {
			throw new Error(`Temporal enhancement failed.\n${yesodErrors.slice(-8000)}`);
		}
		return outputFile;
	}

	validateTarget() {
		if (!Number.isInteger(this.targetFps) || this.targetFps < 2 || this.targetFps > 60) {
			throw new RangeError("Temporal target FPS must be an integer from 2 through 60.");
		}
	}
}
