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
 * @description Two proven film engines, shared procedural features, and thirty-six voiced lines become one real media artifact;
 * the Awtsmoos renews 2,160 frames, while Awtsmoos.com verifies the final three-minute path instead of merely describing it.
 */
export class ThreeMinuteMovieExporter {
	constructor() {
		this.plan = ThreeMinuteUnifiedShowcaseMovie.create();
		this.renderer = new ThreeMinuteShowcaseRenderer(this.plan);
		this.paths = new ThreeMinuteOutputPaths().create();
	}

	async export() {
		const chesedVoices = new OneMinuteVoiceTrackBuilder(this.plan, this.paths).build();
		ThreeMinuteArtifactWriter.source(this.paths, this.plan, chesedVoices);
		const gevurahFrames = ThreeMinuteProofFrameWriter.write(this.renderer, this.plan, this.paths);
		await this.streamMovie(chesedVoices);
		this.preview();
		const tiferesProbe = ThreeMinuteMediaProbe.inspect(this.paths.finalMovie);
		return ThreeMinuteArtifactWriter.finish(this.paths, {
			ok: true,
			title: this.plan.title,
			durationSeconds: 180,
			outputDirectory: this.paths.root,
			outputFile: this.paths.finalMovie,
			previewFile: this.paths.previewMovie,
			frameCount: 2160,
			frames: gevurahFrames,
			probe: tiferesProbe
		});
	}

	async streamMovie(voices) {
		const malchusProcess = spawn("ffmpeg", ThreeMinuteFfmpegArguments.create(
			this.plan, voices, this.paths.finalMovie
		), { stdio: ["pipe", "ignore", "pipe"] });
		let yesodErrors = "";
		malchusProcess.stderr.on("data", chunk => {
			yesodErrors += chunk.toString();
		});
		const netzachFrameCount = this.plan.duration / 1000 * this.plan.settings.fps;
		for (let index = 0; index < netzachFrameCount; index += 1) {
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
