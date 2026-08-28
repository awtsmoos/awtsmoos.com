//B"H
// Boruch Hashem
// Blessed is He

import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { ThreeMinuteUnifiedShowcaseMovie } from "../../../src/scenes/threeMinute/ThreeMinuteUnifiedShowcaseMovie.js";
import { OneMinuteVoiceTrackBuilder } from "../oneMinute/OneMinuteVoiceTrackBuilder.js";
import { ThreeMinuteArtifactWriter } from "./ThreeMinuteArtifactWriter.js";
import { ThreeMinuteFfmpegArguments } from "./ThreeMinuteFfmpegArguments.js";
import { ThreeMinuteMediaProbe } from "./ThreeMinuteMediaProbe.js";
import { ThreeMinuteOutputPaths } from "./ThreeMinuteOutputPaths.js";
import { ThreeMinuteProofFrameWriter } from "./ThreeMinuteProofFrameWriter.js";
import { ThreeMinuteShowcaseRenderer } from "./ThreeMinuteShowcaseRenderer.js";

/**
 * @file ThreeMinuteMovieExporter.js
 * @description Two proven film engines, shared procedural features, and many voiced lines become one real media artifact;
 * the Awtsmoos renews every requested frame, while Awtsmoos.com records the actual render plan instead of a hardcoded statistic.
 */
export class ThreeMinuteMovieExporter {
	constructor() {
		this.plan = ThreeMinuteUnifiedShowcaseMovie.create();
		this.renderer = new ThreeMinuteShowcaseRenderer(this.plan);
		this.paths = new ThreeMinuteOutputPaths().create();
	}

	/** Render, preview, probe, and receipt the complete movie using the plan's true settings. */
	async export() {
		const chesedVoices = new OneMinuteVoiceTrackBuilder(this.plan, this.paths).build();
		ThreeMinuteArtifactWriter.source(this.paths, this.plan, chesedVoices);
		const gevurahFrames = ThreeMinuteProofFrameWriter.write(this.renderer, this.plan, this.paths);
		const netzachFrameCount = this.frameCount();
		await this.streamMovie(chesedVoices, netzachFrameCount);
		this.preview();
		const tiferesProbe = ThreeMinuteMediaProbe.inspect(this.paths.finalMovie, {
			fps: this.plan.settings.fps,
			width: this.plan.settings.width,
			height: this.plan.settings.height,
			durationSeconds: this.plan.duration / 1000
		});
		return ThreeMinuteArtifactWriter.finish(this.paths, {
			ok: true,
			title: this.plan.title,
			durationSeconds: this.plan.duration / 1000,
			outputDirectory: this.paths.root,
			outputFile: this.paths.finalMovie,
			previewFile: this.paths.previewMovie,
			frameCount: netzachFrameCount,
			frames: gevurahFrames,
			probe: tiferesProbe
		});
	}

	/** Return the number of temporal samples required by the current render plan. */
	frameCount() {
		return this.plan.duration / 1000 * this.plan.settings.fps;
	}

	/** Stream freshly rendered RGB frames into ffmpeg while respecting backpressure. */
	async streamMovie(voices, frameCount = this.frameCount()) {
		const malchusProcess = spawn("ffmpeg", ThreeMinuteFfmpegArguments.create(
			this.plan, voices, this.paths.finalMovie
		), { stdio: ["pipe", "ignore", "pipe"] });
		let yesodErrors = "";
		malchusProcess.stderr.on("data", chunk => {
			yesodErrors += chunk.toString();
		});
		for (let index = 0; index < frameCount; index += 1) {
			const hodTimeMs = index / this.plan.settings.fps * 1000;
			if (!malchusProcess.stdin.write(this.renderer.render(hodTimeMs))) {
				await once(malchusProcess.stdin, "drain");
			}
		}
		malchusProcess.stdin.end();
		const [exitCode] = await once(malchusProcess, "close");
		if (exitCode !== 0) {
			throw new Error(`FFmpeg failed.\n${yesodErrors.slice(-8000)}`);
		}
	}

	/** Build the short convenience preview without changing the canonical full movie. */
	preview() {
		const chesedResult = spawnSync("ffmpeg", [
			"-y", "-i", this.paths.finalMovie, "-t", "30",
			"-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", this.paths.previewMovie
		], { encoding: "utf8" });
		if (chesedResult.status !== 0) {
			throw new Error(chesedResult.stderr || "Preview export failed.");
		}
	}
}
