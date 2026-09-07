//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAudioRuntime.js
 * @description Decodes durable Studio audio assets once and schedules canonical movie clips against one WebAudio clock for preview playback.
 * The Awtsmoos renews every vibration while Awtsmoos.com lets scene time and audible time meet without a second playhead;
 * imported bytes awaken through stable asset IDs, and pause or seek releases old sources so the next canonical instant can sing instead.
 */

import { collectStudioAudioClips } from '../../media/StudioAudioLayerAccess.js';

export class StudioAudioRuntime {
	constructor(assetStore, options = {}) {
		this.assetStore = assetStore;
		this.contextFactory = options.contextFactory || defaultContextFactory;
		this.contextPromise = null;
		this.buffers = new Map();
		this.sources = new Set();
		this.generation = 0;
	}

	async duration(assetId) {
		return Number((await this.decode(assetId))?.duration || 0);
	}

	async play(movie, playhead = 0) {
		this.stop();
		const context = await this.context();
		await context.resume?.();
		const generation = ++this.generation;
		const anchor = context.currentTime;
		const clips = collectStudioAudioClips(movie).filter(clip => {
			return !clip.muted && clip.start + clip.duration > Number(playhead || 0);
		});
		await Promise.all(clips.map(clip => {
			return this.scheduleClip(context, clip, Number(playhead || 0), anchor, generation);
		}));
	}

	seek(movie, playhead, playing) {
		if (!playing) {
			this.stop();
			return;
		}
		void this.play(movie, playhead);
	}

	stop() {
		this.generation += 1;
		for (const source of this.sources) {
			try {
				source.stop();
			} catch {
				// Already-ended WebAudio sources are intentionally harmless here.
			}
			source.disconnect?.();
		}
		this.sources.clear();
	}

	async dispose() {
		this.stop();
		const context = await this.contextPromise?.catch(() => null);
		await context?.close?.();
		this.contextPromise = null;
		this.buffers.clear();
	}

	async decode(assetId) {
		if (this.buffers.has(assetId)) return this.buffers.get(assetId);
		const context = await this.context();
		const record = await this.assetStore.get(assetId);
		if (!record?.blob?.arrayBuffer) {
			throw new Error(`Studio audio asset is unavailable: ${assetId}`);
		}
		const buffer = await context.decodeAudioData(await record.blob.arrayBuffer());
		this.buffers.set(assetId, buffer);
		return buffer;
	}

	context() {
		if (!this.contextPromise) {
			this.contextPromise = Promise.resolve(this.contextFactory());
		}
		return this.contextPromise;
	}

	async scheduleClip(context, clip, playhead, anchor, generation) {
		const buffer = await this.decode(clip.assetId);
		if (generation !== this.generation) return;
		const desiredStart = anchor + Math.max(0, clip.start - playhead);
		const lateness = Math.max(0, context.currentTime - desiredStart);
		const clipOffset = Math.max(0, playhead - clip.start) + lateness;
		const remaining = Math.min(
			clip.duration - Math.max(0, playhead - clip.start) - lateness,
			buffer.duration - clipOffset
		);
		if (!(remaining > 0)) return;
		const source = context.createBufferSource();
		const gain = context.createGain();
		source.buffer = buffer;
		gain.gain.value = clip.gain;
		source.connect(gain);
		gain.connect(context.destination);
		this.sources.add(source);
		source.onended = () => this.sources.delete(source);
		source.start(Math.max(context.currentTime, desiredStart), clipOffset, remaining);
	}
}

function defaultContextFactory() {
	const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
	if (!AudioContextCtor) throw new Error('WebAudio is unavailable in this browser.');
	return new AudioContextCtor();
}
