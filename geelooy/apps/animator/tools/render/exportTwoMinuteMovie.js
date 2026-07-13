// B"H
// Boruch Hashem
// Blessed is He
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { TwoMinuteStrategyMovie } from '../../src/scenes/TwoMinuteStrategyMovie.js';
import { CinematicFrameRenderer } from './CinematicFrameRenderer.js';

/**
 * The complete edit leaves the browser and becomes a verified movie. Frames
 * stream directly into FFmpeg; the Awtsmoos renews each one without a mountain
 * of temporary images, and FFprobe testifies to the final vessel.
 */
class TwoMinuteMovieExporter {
	constructor() {
		this.plan = TwoMinuteStrategyMovie.create();
		this.renderer = new CinematicFrameRenderer(this.plan);
		this.fps = this.plan.settings.fps;
		this.frameCount = Math.round(this.plan.duration / 1000 * this.fps);
		this.outputDirectory = this.createOutputDirectory();
		this.outputFile = join(this.outputDirectory, 'the-strategy-meeting-that-walked-away.mp4');
	}

	createOutputDirectory() {
		const stamp = new Date().toISOString().replace(/[:.]/g, '-');
		const directory = join(homedir(), 'Movies', 'AwtsmoosAnimatorExports', stamp);
		mkdirSync(directory, { recursive: true });
		return directory;
	}

	async export() {
		this.writeProductionArtifacts();
		const ffmpeg = spawn('ffmpeg', this.ffmpegArguments(), { stdio: ['pipe', 'pipe', 'pipe'] });
		let errorOutput = '';
		ffmpeg.stderr.on('data', chunk => {
			errorOutput += chunk.toString();
		});
		ffmpeg.stdout.resume();

		for (let frameIndex = 0; frameIndex < this.frameCount; frameIndex += 1) {
			const timeMs = frameIndex / this.fps * 1000;
			const frame = this.renderer.render(timeMs);
			if (!ffmpeg.stdin.write(frame)) await once(ffmpeg.stdin, 'drain');
			if (frameIndex % this.fps === 0) process.stdout.write(`\rRendering ${Math.floor(timeMs / 1000)}s / 120s`);
		}

		ffmpeg.stdin.end();
		const [exitCode] = await once(ffmpeg, 'close');
		process.stdout.write('\n');
		if (exitCode !== 0) throw new Error(`FFmpeg failed with code ${exitCode}.\n${errorOutput.slice(-8000)}`);
		const probe = this.probe();
		this.assertProbe(probe);
		writeFileSync(join(this.outputDirectory, 'ffprobe.json'), JSON.stringify(probe, null, 2));
		const result = { ok: true, outputDirectory: this.outputDirectory, outputFile: this.outputFile, durationSeconds: 120, fps: this.fps, probe };
		writeFileSync(join(this.outputDirectory, 'export-result.json'), JSON.stringify(result, null, 2));
		return result;
	}

	ffmpegArguments() {
		const audio = '0.045*sin(2*PI*196*t)+0.025*sin(2*PI*293.66*t)+0.012*sin(2*PI*392*t)';
		return [
			'-y',
			'-f', 'rawvideo',
			'-pixel_format', 'rgb24',
			'-video_size', `${this.plan.settings.width}x${this.plan.settings.height}`,
			'-framerate', String(this.fps),
			'-i', 'pipe:0',
			'-f', 'lavfi',
			'-i', `aevalsrc=${audio}:s=48000:d=120`,
			'-c:v', 'libx264',
			'-preset', 'veryfast',
			'-crf', '21',
			'-pix_fmt', 'yuv420p',
			'-c:a', 'aac',
			'-b:a', '128k',
			'-af', 'afade=t=in:st=0:d=1,afade=t=out:st=118:d=2',
			'-t', '120',
			'-movflags', '+faststart',
			this.outputFile
		];
	}

	writeProductionArtifacts() {
		writeFileSync(join(this.outputDirectory, 'production-bible.json'), JSON.stringify(this.plan, null, 2));
		writeFileSync(join(this.outputDirectory, 'edit-decision-list.json'), JSON.stringify(this.plan.nle, null, 2));
	}

	probe() {
		const result = spawnSync('ffprobe', [
			'-v', 'error',
			'-show_entries', 'format=duration:stream=index,codec_name,codec_type,width,height,r_frame_rate',
			'-of', 'json',
			this.outputFile
		], { encoding: 'utf8' });
		if (result.status !== 0) throw new Error(result.stderr || 'FFprobe failed.');
		return JSON.parse(result.stdout);
	}

	assertProbe(probe) {
		const video = probe.streams.find(stream => stream.codec_type === 'video');
		const audio = probe.streams.find(stream => stream.codec_type === 'audio');
		const duration = Number(probe.format.duration);
		if (!video || video.codec_name !== 'h264') throw new Error('Verified H.264 video stream is missing.');
		if (!audio || audio.codec_name !== 'aac') throw new Error('Verified AAC audio stream is missing.');
		if (video.width !== 640 || video.height !== 360) throw new Error('Verified movie dimensions are not 640x360.');
		if (duration < 119.5 || duration > 120.5) throw new Error(`Verified duration ${duration} is not two minutes.`);
	}
}

const exporter = new TwoMinuteMovieExporter();
exporter.export()
	.then(result => console.log(JSON.stringify(result, null, 2)))
	.catch(error => {
		console.error(error.stack || error);
		process.exitCode = 1;
	});
