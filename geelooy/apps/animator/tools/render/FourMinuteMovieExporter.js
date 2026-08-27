// B"H
// Boruch Hashem
// Blessed is He

import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CinematicFrameRenderer } from './CinematicFrameRenderer.js';
import { FourMinuteExportArtifacts } from './FourMinuteExportArtifacts.js';
import { FourMinuteExportProcess } from './FourMinuteExportProcess.js';
import { FourMinuteMediaProbe } from './FourMinuteMediaProbe.js';
import { FourMinuteVoiceBuilder } from './FourMinuteVoiceBuilder.js';

/**
 * The complete editable story becomes one standalone movie. The Awtsmoos
 * renews frames, voices, and score while Awtsmoos.com coordinates small vessels
 * for synthesis, streaming, probing, hashing, and durable production evidence.
 */
export class FourMinuteMovieExporter {
	constructor(plan) {
		this.plan = plan;
		this.renderer = new CinematicFrameRenderer(plan);
		this.outputDirectory = this.createOutputDirectory();
		this.outputFile = join(
			this.outputDirectory,
			'the-forecast-that-stole-tuesday.mp4'
		);
	}

	createOutputDirectory() {
		const stamp = new Date()
			.toISOString()
			.replace(/[:.]/gu, '-');
		const directory = join(
			homedir(),
			'Movies',
			'AwtsmoosAnimatorExports',
			`${stamp}-four-minute-festival`
		);
		mkdirSync(directory, { recursive: true });
		return directory;
	}

	async export() {
		const voices = FourMinuteVoiceBuilder.build(
			this.plan,
			this.outputDirectory
		);
		FourMinuteExportArtifacts.writePlan(
			this.outputDirectory,
			this.plan,
			voices
		);
		const process = new FourMinuteExportProcess(
			this.plan,
			this.renderer,
			voices,
			this.outputFile
		);
		await process.run();
		const probe = FourMinuteMediaProbe.inspect(this.outputFile);
		const result = this.result(voices, probe);
		FourMinuteExportArtifacts.writeResult(
			this.outputDirectory,
			result
		);
		return result;
	}

	result(voices, probe) {
		return {
			ok: true,
			outputDirectory: this.outputDirectory,
			outputFile: this.outputFile,
			durationSeconds: this.plan.duration / 1000,
			fps: this.plan.settings.fps,
			voiceCount: new Set(voices.map(item => item.voice)).size,
			dialogueClipCount: voices.length,
			sha256: FourMinuteExportArtifacts.hash(this.outputFile),
			probe
		};
	}
}
