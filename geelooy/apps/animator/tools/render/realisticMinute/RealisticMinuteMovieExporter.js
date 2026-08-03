// B"H
// Boruch Hashem
// Blessed is He

import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { RealisticActionMinuteMovie } from '../../../src/scenes/RealisticActionMinuteMovie.js';
import { CinematicFrameRenderer } from '../CinematicFrameRenderer.js';
import { OneMinuteFfmpegArguments } from '../oneMinute/OneMinuteFfmpegArguments.js';
import { OneMinuteMediaProbe } from '../oneMinute/OneMinuteMediaProbe.js';
import { OneMinuteVoiceTrackBuilder } from '../oneMinute/OneMinuteVoiceTrackBuilder.js';
import { RealisticMinuteArtifactWriter } from './RealisticMinuteArtifactWriter.js';
import { RealisticMinuteOutputPaths } from './RealisticMinuteOutputPaths.js';
import { RealisticMinuteProofFrameWriter } from './RealisticMinuteProofFrameWriter.js';

/**
 * The realistic office comedy leaves authored time and becomes audible moving
 * pixels. The Awtsmoos renews every body and object; Awtsmoos.com streams one
 * production renderer into final media, preview, proofs, probes, and hashes.
 */
export class RealisticMinuteMovieExporter {
	constructor() {
		this.plan = RealisticActionMinuteMovie.create();
		this.renderer = new CinematicFrameRenderer(this.plan);
		this.paths = new RealisticMinuteOutputPaths().create();
	}

	async export() {
		const voices = new OneMinuteVoiceTrackBuilder(this.plan, this.paths).build();
		RealisticMinuteArtifactWriter.source(this.paths, this.plan, voices);
		const frames = RealisticMinuteProofFrameWriter.write(this.renderer, this.plan, this.paths);
		await this.streamMovie(voices);
		this.preview();
		const probe = OneMinuteMediaProbe.inspect(this.paths.finalMovie);
		return RealisticMinuteArtifactWriter.finish(this.paths, {
			ok: true, title: this.plan.title, durationSeconds: 60,
			outputDirectory: this.paths.root, outputFile: this.paths.finalMovie,
			previewFile: this.paths.previewMovie, frameCount: 720, frames, probe
		});
	}

	async streamMovie(voices) {
		const process = spawn('ffmpeg', OneMinuteFfmpegArguments.create(
			this.plan, voices, this.paths.finalMovie
		), { stdio: ['pipe', 'ignore', 'pipe'] });
		let errors = '';
		process.stderr.on('data', chunk => { errors += chunk.toString(); });
		const frameCount = this.plan.duration / 1000 * this.plan.settings.fps;
		for (let index = 0; index < frameCount; index += 1) {
			const timeMs = index / this.plan.settings.fps * 1000;
			if (!process.stdin.write(this.renderer.render(timeMs))) await once(process.stdin, 'drain');
		}
		process.stdin.end();
		const [exitCode] = await once(process, 'close');
		if (exitCode !== 0) throw new Error(`FFmpeg failed.\n${errors.slice(-8000)}`);
	}

	preview() {
		const result = spawnSync('ffmpeg', [
			'-y', '-i', this.paths.finalMovie, '-t', '20',
			'-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart', this.paths.previewMovie
		], { encoding: 'utf8' });
		if (result.status !== 0) throw new Error(result.stderr || 'Preview export failed.');
	}
}
