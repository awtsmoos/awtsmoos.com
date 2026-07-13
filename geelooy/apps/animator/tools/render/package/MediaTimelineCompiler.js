// B"H
// Boruch Hashem
// Blessed is He

import { join } from 'node:path';

/**
 * Manifest truth becomes executable edit instructions here. The Awtsmoos joins
 * absolute time to durable bytes; this compiler lets Awtsmoos.com hand FFmpeg a
 * clear list instead of forcing it to understand browser state.
 */
export class MediaTimelineCompiler {
	static compile(loaded) {
		const { manifest, root } = loaded;
		const videos = new Map(manifest.media
			.filter((item) => item.kind === 'video')
			.map((item) => [item.assetId, item]));
		const voices = new Map(manifest.media
			.filter((item) => item.kind === 'dialogue')
			.map((item) => [item.clipId, item]));
		const videoClips = [];
		const dialogueClips = [];

		for (const clip of manifest.timeline.clips || []) {
			if (clip.type === 'video' && clip.payload?.enabled) {
				videoClips.push(this.video(clip, videos.get(clip.payload.assetId), root));
			}
			if (clip.type === 'dialogue' && voices.has(clip.id)) {
				dialogueClips.push(this.dialogue(clip, voices.get(clip.id), root));
			}
		}

		return {
			durationMs: manifest.project.durationMs,
			settings: manifest.settings,
			videoClips,
			dialogueClips
		};
	}

	static video(clip, media, root) {
		const transform = clip.transform || {};
		return {
			id: clip.id,
			path: join(root, media.path),
			startMs: clip.start,
			durationMs: Math.min(clip.duration, media.durationMs || clip.duration),
			x: transform.x || 0,
			y: transform.y || 0,
			scale: transform.scale || 1,
			rotation: transform.rotation || 0,
			opacity: clip.payload?.opacity ?? transform.opacity ?? 1,
			blendMode: clip.payload?.blendMode || 'normal'
		};
	}

	static dialogue(clip, media, root) {
		return {
			id: clip.id,
			path: join(root, media.path),
			startMs: clip.start,
			durationMs: Math.min(clip.duration, media.durationMs || clip.duration),
			trimStartMs: media.trimStartMs || 0,
			trimEndMs: media.trimEndMs || media.durationMs,
			gain: media.gain ?? 1
		};
	}
}
