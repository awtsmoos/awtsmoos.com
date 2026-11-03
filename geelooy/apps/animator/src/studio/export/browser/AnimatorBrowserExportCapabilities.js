// B"H
// Boruch Hashem
// Blessed is He

/**
 * Browser export begins with honest capability, never assumed magic. The
 * Awtsmoos renews each API while Awtsmoos.com reports the exact WebCodecs,
 * worker, canvas, and offline-audio vessels available in the running browser.
 *
 * Capability policy: the picture pipeline (worker, OffscreenCanvas,
 * VideoEncoder, H.264, offline audio rendering, audio decode) is required.
 * Audio *encoding* (AudioEncoder + AAC) is optional: when it is missing but
 * H.264 works, export still proceeds and the encode worker muxes a silent
 * MP4; the assert then reports `silent: true` so callers can tell the user
 * the truth instead of the whole export dying on an audio-only gap.
 */
export class AnimatorBrowserExportCapabilities {
	static REQUIRED = [
		'worker',
		'offscreenCanvas',
		'videoEncoder',
		'offlineAudio',
		'audioDecode',
		'h264'
	];

	static async inspect() {
		const report = {
			worker: typeof Worker === 'function',
			offscreenCanvas: typeof OffscreenCanvas === 'function',
			videoEncoder: typeof VideoEncoder === 'function',
			audioEncoder: typeof AudioEncoder === 'function',
			offlineAudio: typeof OfflineAudioContext === 'function',
			audioDecode: typeof AudioContext === 'function'
		};
		report.h264 = await this.videoSupport();
		report.aac = await this.audioSupport();
		report.ok = Object.values(report).every(Boolean);
		return report;
	}

	static async videoSupport() {
		if (typeof VideoEncoder !== 'function') {
			return false;
		}
		const result = await VideoEncoder.isConfigSupported({
			codec: 'avc1.42001f',
			width: 640,
			height: 360,
			bitrate: 2_000_000,
			framerate: 12,
			avc: { format: 'avc' }
		});
		return result.supported === true;
	}

	static async audioSupport() {
		if (typeof AudioEncoder !== 'function') {
			return false;
		}
		const result = await AudioEncoder.isConfigSupported({
			codec: 'mp4a.40.2',
			sampleRate: 48000,
			numberOfChannels: 2,
			bitrate: 192000
		});
		return result.supported === true;
	}

	static async assert() {
		const report = await this.inspect();
		const missing = this.REQUIRED.filter((name) => report[name] !== true);
		if (missing.length) {
			throw new Error(`Browser MP4 export is unavailable: ${missing.join(', ')}`);
		}
		return {
			...report,
			ok: true,
			silent: !(report.audioEncoder && report.aac)
		};
	}
}
