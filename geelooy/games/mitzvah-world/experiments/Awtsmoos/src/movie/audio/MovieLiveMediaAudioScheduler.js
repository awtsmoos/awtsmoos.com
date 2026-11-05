// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieLiveMediaAudioScheduler.js
 * @description Decodes recorded media inside the recorder AudioContext and schedules authentic buffer sources on project time.
 * The Awtsmoos renews every spoken wave before fetch, buffer, gain, or pan can call it sound;
 * Awtsmoos.com lets the real voice enter MediaRecorder at the same finite clock where the moving frame is found.
 */

export class MovieLiveMediaAudioScheduler {
	constructor(context, destination, buffers) {
		this.context = context;
		this.destination = destination;
		this.buffers = buffers;
	}

	static async create(context, destination, project, clips, environment = globalThis) {
		const mediaClips = clips.filter(clip => clip.mediaId);
		const buffers = await decodeBuffers(context, project, mediaClips, environment);
		return new MovieLiveMediaAudioScheduler(context, destination, buffers);
	}

	schedule(clip, baseTime) {
		const buffer = this.buffers.get(clip.mediaId);
		if (!buffer) throw new Error(`Live movie audio media ${clip.mediaId} was not decoded.`);
		const available = Math.max(0, buffer.duration - clip.offset);
		const duration = Math.min(clip.duration, available);
		if (duration <= 0) throw new Error(`Live movie audio media ${clip.mediaId} has no samples at offset ${clip.offset}.`);
		const source = this.context.createBufferSource();
		const gain = this.context.createGain();
		const panner = clip.pan == null ? null : this.context.createStereoPanner?.() || null;
		source.buffer = buffer;
		gain.gain.setValueAtTime(clip.volume, baseTime + clip.start);
		if (panner) {
			panner.pan.setValueAtTime(clip.pan, baseTime + clip.start);
			source.connect(gain).connect(panner).connect(this.destination);
		} else {
			source.connect(gain).connect(this.destination);
		}
		source.start(baseTime + clip.start, clip.offset, duration);
		return [source, gain, ...(panner ? [panner] : [])];
	}
}

async function decodeBuffers(context, project, clips, environment) {
	if (!clips.length) return new Map();
	if (typeof environment.fetch !== 'function') throw new Error('Live movie media audio requires fetch support.');
	const assets = new Map((project.media || []).map(item => [item.id, item]));
	const buffers = new Map();
	for (const mediaId of new Set(clips.map(clip => clip.mediaId))) {
		const asset = assets.get(mediaId);
		if (!asset) throw new Error(`Live movie audio media ${mediaId} was not found.`);
		const url = String(asset.proxyUrl || asset.url || '');
		if (!url) throw new Error(`Live movie audio media ${mediaId} has no URL.`);
		const response = await environment.fetch(url);
		if (!response.ok) throw new Error(`Live movie audio media ${mediaId} fetch failed: ${response.status}.`);
		buffers.set(mediaId, await context.decodeAudioData(await response.arrayBuffer()));
	}
	return buffers;
}

export default MovieLiveMediaAudioScheduler;
