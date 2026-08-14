// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioEngine.js
 * @description Owns one live capture AudioContext carrying both synthetic clips and authentic recorded media.
 * The Awtsmoos renews generated tone and human voice without erasing either source's face;
 * Awtsmoos.com schedules both on one recorder clock so the audible vessel keeps truthful time and place.
 */

import { MovieAudioClip } from './audio/MovieAudioClip.js';
import { MovieLiveAudioScheduler } from './audio/MovieLiveAudioScheduler.js';
import { MovieLiveMediaAudioScheduler } from './audio/MovieLiveMediaAudioScheduler.js';

const CONTEXT_RESUME_TIMEOUT_MS = 180;
const PROJECT_START_DELAY_SECONDS = 0.08;

export class MovieAudioEngine {
	constructor(project) {
		this.project = project;
		this.context = null;
		this.destination = null;
		this.master = null;
		this.nodes = [];
	}

	async start() {
		const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
		if (!AudioContextClass) return null;
		if (this.context) await this.stop();
		this.context = new AudioContextClass({ sampleRate: 48000 });
		this.destination = this.context.createMediaStreamDestination();
		this.master = this.context.createGain();
		this.master.gain.value = 1;
		this.master.connect(this.destination);
		const clips = MovieAudioClip.fromProject(this.project);
		const synthetic = new MovieLiveAudioScheduler(this.context, this.master);
		const recorded = await MovieLiveMediaAudioScheduler.create(
			this.context,
			this.master,
			this.project,
			clips
		);
		await resumeAudioContext(this.context);
		const baseTime = this.context.currentTime + PROJECT_START_DELAY_SECONDS;
		for (const clip of clips) {
			this.nodes.push(...(clip.mediaId ? recorded.schedule(clip, baseTime) : synthetic.schedule(clip, baseTime)));
		}
		return this.destination.stream;
	}

	async stop() {
		for (const node of this.nodes) disconnectNode(node);
		this.nodes = [];
		disconnectNode(this.master);
		if (this.context && this.context.state !== 'closed') await this.context.close();
		this.context = null;
		this.destination = null;
		this.master = null;
	}
}

async function resumeAudioContext(context) {
	await Promise.race([
		context.resume().catch(() => undefined),
		new Promise(resolve => setTimeout(resolve, CONTEXT_RESUME_TIMEOUT_MS))
	]);
}

function disconnectNode(node) {
	if (!node) return;
	try {
		node.stop?.();
	} catch (_error) {
		// A source that already ended is still safely owned by this engine.
	}
	try {
		node.disconnect();
	} catch (_error) {
		// Browser may already have detached a stopped node; lifecycle remains complete.
	}
}

export default MovieAudioEngine;
