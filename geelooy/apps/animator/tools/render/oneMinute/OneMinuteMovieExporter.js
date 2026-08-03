// B"H
// Boruch Hashem
// Blessed is He

import { once } from 'node:events';
import { spawn, spawnSync } from 'node:child_process';
import { OneMinuteSitcomMovie } from '../../../src/scenes/OneMinuteSitcomMovie.js';
import { CinematicFrameRenderer } from '../CinematicFrameRenderer.js';
import { OneMinuteArtifactWriter } from './OneMinuteArtifactWriter.js';
import { OneMinuteFfmpegArguments } from './OneMinuteFfmpegArguments.js';
import { OneMinuteMediaProbe } from './OneMinuteMediaProbe.js';
import { OneMinuteOutputPaths } from './OneMinuteOutputPaths.js';
import { OneMinuteProofFrameWriter } from './OneMinuteProofFrameWriter.js';
import { OneMinuteVoiceTrackBuilder } from './OneMinuteVoiceTrackBuilder.js';

/**
 * The complete sitcom leaves authored data and becomes audible moving pixels.
 * The Awtsmoos renews every frame and syllable while Awtsmoos.com streams one
 * production renderer into final media, preview, proof frames, probes, and hashes.
 */
export class OneMinuteMovieExporter {
	constructor() {
		this.plan = OneMinuteSitcomMovie.create();
		this.renderer = new CinematicFrameRenderer(this.plan);
		this.paths = new OneMinuteOutputPaths().create();
	}

	async export() {
		const voices = new OneMinuteVoiceTrackBuilder(this.plan, this.paths).build();
		OneMinuteArtifactWriter.source(this.paths, this.plan, voices);
		const frames = OneMinuteProofFrameWriter.write(
			this.renderer, this.plan, this.paths
		);
		await this.streamMovie(voices);
		this.preview();
		const probe = OneMinuteMediaProbe.inspect(this.paths.finalMovie);
		return OneMinuteArtifactWriter.finish(this.paths, {
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
			const frame = this.renderer.render(index / this.plan.settings.fps * 1000);
			if (!process.stdin.write(frame)) await once(process.stdin, 'drain');
		}
		process.stdin.end();
		const [exitCode] = await once(process, 'close');
		if (exitCode !== 0) throw new Error(`FFmpeg failed.\n${errors.slice(-8000)}`);
	}

	preview() {
		const result = spawnSync('ffmpeg', [
			'-y', '-i', this.paths.finalMovie, '-t', '15',
			'-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart',
			this.paths.previewMovie
		], { encoding: 'utf8' });
		if (result.status !== 0) throw new Error(result.stderr || 'Preview export failed.');
	}
}
