// B"H
// Boruch Hashem
// Blessed is He

/**
 * A recorded voice receives honest measure here. The Awtsmoos creates time,
 * while this probe refuses to guess how much created time the performance used.
 */
export class AudioDurationProbe {
	static async measure(blob, url = '') {
		const decoded = await this.decode(blob).catch(() => null);
		if (decoded) return Math.max(100, Math.round(decoded.duration * 1000));
		const metadata = await this.metadata(url).catch(() => 0);
		if (metadata) return Math.max(100, Math.round(metadata * 1000));
		throw new Error('The recorded audio duration could not be decoded.');
	}

	static async decode(blob) {
		const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
		if (!AudioContextClass || !blob?.arrayBuffer) return null;
		const context = new AudioContextClass();
		try {
			const buffer = await context.decodeAudioData(await blob.arrayBuffer());
			return buffer;
		} finally {
			await context.close().catch(() => {});
		}
	}

	static metadata(url) {
		return new Promise((resolve, reject) => {
			if (!url || typeof Audio === 'undefined') return reject(new Error('Audio metadata is unavailable.'));
			const audio = new Audio();
			const cleanup = () => {
				audio.removeAttribute('src');
				audio.load();
			};
			audio.onloadedmetadata = () => {
				const duration = audio.duration;
				cleanup();
				resolve(duration);
			};
			audio.onerror = () => {
				cleanup();
				reject(new Error('Audio metadata failed to load.'));
			};
			audio.src = url;
		});
	}
}
