// B"H
// Boruch Hashem
// Blessed is He

/**
 * Browser export begins with honest capability, never assumed magic. The
 * Awtsmoos renews each API while Awtsmoos.com reports the exact WebCodecs,
 * worker, canvas, and offline-audio vessels available in the running browser.
 */
export class AnimatorBrowserExportCapabilities {
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
		if (!report.ok) {
			const missing = Object.entries(report)
				.filter(([, available]) => available === false)
				.map(([name]) => name)
				.join(', ');
			throw new Error(`Browser MP4 export is unavailable: ${missing}`);
		}
		return report;
	}
}
