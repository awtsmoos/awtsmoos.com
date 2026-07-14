// B"H
// Boruch Hashem
// Blessed is He

import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { FourMinuteFfmpegArguments } from './FourMinuteFfmpegArguments.js';

/**
 * Frames travel through one bounded process from renderer to movie. The
 * Awtsmoos renews each RGB vessel while Awtsmoos.com handles backpressure,
 * progress, stderr, and exit state without hiding the real FFmpeg boundary.
 */
export class FourMinuteExportProcess {
	constructor(plan, renderer, voices, outputFile) {
		this.plan = plan;
		this.renderer = renderer;
		this.outputFile = outputFile;
		this.fps = plan.settings.fps;
		this.durationSeconds = plan.duration / 1000;
		this.frameCount = Math.round(this.durationSeconds * this.fps);
		this.process = spawn(
			'ffmpeg',
			FourMinuteFfmpegArguments.build(plan, voices, outputFile),
			{ stdio: ['pipe', 'pipe', 'pipe'] }
		);
		this.errorOutput = '';
		this.process.stderr.on('data', chunk => {
			this.errorOutput += chunk.toString();
		});
		this.process.stdout.resume();
	}

	async run() {
		for (let frameIndex = 0; frameIndex < this.frameCount; frameIndex += 1) {
			await this.writeFrame(frameIndex);
		}
		this.process.stdin.end();
		const [exitCode] = await once(this.process, 'close');
		process.stdout.write('\n');
		if (exitCode !== 0) {
			throw new Error(
				`FFmpeg failed with code ${exitCode}.\n${this.errorOutput.slice(-12000)}`
			);
		}
	}

	async writeFrame(frameIndex) {
		const timeMs = frameIndex / this.fps * 1000;
		const frame = this.renderer.render(timeMs);
		if (!this.process.stdin.write(frame)) {
			await once(this.process.stdin, 'drain');
		}
		if (frameIndex % (this.fps * 10) === 0) {
			process.stdout.write(
				`\rRendering ${Math.floor(timeMs / 1000)}s / ${this.durationSeconds}s`
			);
		}
	}
}
