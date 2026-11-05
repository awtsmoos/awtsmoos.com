// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactAudioRenderer.js
 * @description Renders synthetic and real media-backed project audio into deterministic bounded PCM16 blocks.
 * The Awtsmoos renews millions of spoken and generated samples without fatigue or substitution;
 * Awtsmoos.com lets authentic voice and authored score share one exact WAV vessel through measured continuation.
 */

import { MovieFrameScheduler } from '../MovieFrameScheduler.js';
import { MovieAudioClip } from './MovieAudioClip.js';
import {
	EXACT_AUDIO_CHANNELS,
	EXACT_AUDIO_SAMPLE_RATE,
	exactAudioSampleFrames
} from './MovieExactAudioContract.js';
import { MovieAudioRenderMetrics } from './MovieAudioRenderMetrics.js';
import { MovieAudioSampleSynthesizer } from './MovieAudioSampleSynthesizer.js';
import { createMovieMediaAudioSampler } from './MovieMediaAudioSampler.js';
import { renderMoviePcm16Block } from './MoviePcm16BlockRenderer.js';
import { MovieWaveWriter } from './MovieWaveWriter.js';

const DEFAULT_BLOCK_FRAMES = 65536;

export class MovieExactAudioRenderer {
	constructor(project, options = {}) {
		this.project = project;
		this.channels = options.channels || EXACT_AUDIO_CHANNELS;
		this.sampleRate = options.sampleRate || EXACT_AUDIO_SAMPLE_RATE;
		this.blockFrames = options.blockFrames || DEFAULT_BLOCK_FRAMES;
		this.scheduler = options.scheduler || new MovieFrameScheduler();
		this.ownsScheduler = !options.scheduler;
		this.environment = options.environment || globalThis;
	}

	async render(options = {}) {
		const clips = MovieAudioClip.fromProject(this.project);
		const sampleFrames = exactAudioSampleFrames(this.project.duration, this.sampleRate);
		const mediaSampler = await createMovieMediaAudioSampler(this.project, this.sampleRate, this.environment);
		const synthesizer = new MovieAudioSampleSynthesizer(clips, this.sampleRate, mediaSampler);
		const metrics = new MovieAudioRenderMetrics();
		const writer = new MovieWaveWriter({ channels: this.channels, sampleFrames, sampleRate: this.sampleRate });
		const startedAtMs = this.scheduler.now();
		try {
			for (let startFrame = 0; startFrame < sampleFrames; startFrame += this.blockFrames) {
				assertActive(options.shouldAbort);
				const frameCount = Math.min(this.blockFrames, sampleFrames - startFrame);
				writer.addBlock(renderMoviePcm16Block({
					channels: this.channels,
					frameCount,
					metrics,
					startFrame,
					synthesizer
				}));
				options.onProgress?.(audioProgress(startFrame + frameCount, sampleFrames));
				await this.scheduler.yieldFrame();
			}
			return audioResult({
				blob: writer.toBlob(),
				channels: this.channels,
				clipCount: clips.length,
				elapsedMs: this.scheduler.now() - startedAtMs,
				metrics: metrics.toJSON(),
				sampleFrames,
				sampleRate: this.sampleRate
			});
		} finally {
			if (this.ownsScheduler) this.scheduler.dispose();
		}
	}
}

function audioProgress(completedFrames, sampleFrames) {
	return { completedFrames, percent: completedFrames / sampleFrames * 100, sampleFrames };
}

function audioResult(values) {
	return { ...values, duration: values.sampleFrames / values.sampleRate };
}

function assertActive(shouldAbort) {
	if (shouldAbort?.()) throw new Error('Exact audio render was aborted.');
}

export default MovieExactAudioRenderer;
