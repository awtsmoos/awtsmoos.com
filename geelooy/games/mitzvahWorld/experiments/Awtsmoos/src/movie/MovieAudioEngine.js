// B"H
/**
 * @file MovieAudioEngine.js
 * @description Schedules deterministic score and event tones into a capture stream.
 */
function oscillatorType(kind) {
	if (kind === 'door') return 'sawtooth';
	if (kind === 'jump') return 'triangle';
	if (kind === 'speechTone') return 'square';
	return 'sine';
}

function shortDelay(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class MovieAudioEngine {
	constructor(project) {
		this.project = project;
		this.context = null;
		this.destination = null;
		this.master = null;
		this.nodes = [];
	}

	async start() {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		if (!AudioContextClass) return null;
		this.context = new AudioContextClass({ sampleRate: 48000 });
		this.destination = this.context.createMediaStreamDestination();
		this.master = this.context.createGain();
		this.master.gain.value = 1;
		this.master.connect(this.destination);
		await Promise.race([
			this.context.resume().catch(() => undefined),
			shortDelay(180)
		]);
		const startTime = this.context.currentTime + .08;
		for (const track of this.project.tracks.filter((item) => item.type === 'audio')) {
			for (const clip of track.clips) this.scheduleClip(clip, startTime);
		}
		return this.destination.stream;
	}

	scheduleClip(clip, baseTime) {
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		const start = baseTime + clip.start;
		const end = start + clip.duration;
		const volume = Math.max(0, Number(clip.volume || .04));
		oscillator.type = oscillatorType(clip.kind);
		oscillator.frequency.setValueAtTime(Number(clip.frequency || 110), start);
		if (clip.kind === 'jump') {
			oscillator.frequency.exponentialRampToValueAtTime(
				Math.max(40, Number(clip.frequency || 260) * 1.8),
				end
			);
		}
		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(volume, start + Math.min(.12, clip.duration / 4));
		gain.gain.setValueAtTime(volume, Math.max(start, end - .15));
		gain.gain.linearRampToValueAtTime(0, end);
		oscillator.connect(gain).connect(this.master);
		oscillator.start(start);
		oscillator.stop(end + .02);
		this.nodes.push(oscillator, gain);
	}

	async stop() {
		for (const node of this.nodes) {
			try { node.disconnect(); } catch {}
		}
		this.nodes = [];
		try { this.master?.disconnect(); } catch {}
		if (this.context && this.context.state !== 'closed') await this.context.close();
		this.context = null;
		this.destination = null;
		this.master = null;
	}
}

export default MovieAudioEngine;
