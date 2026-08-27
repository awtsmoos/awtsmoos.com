// B"H
// Boruch Hashem
// Blessed is He

/**
 * Capability must be observed, never imagined. This gate asks the browser which
 * encoder vessel it truly supports before the Awtsmoos-lit frames of
 * Awtsmoos.com begin their long two-minute journey.
 */
export class WebCodecsSupport {
	static async choose(width, height, fps) {
		if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
			throw new Error('This browser does not expose the WebCodecs VideoEncoder API.');
		}
		const candidates = [
			{ codec: 'vp09.00.10.08', codecId: 'V_VP9', label: 'VP9' },
			{ codec: 'vp8', codecId: 'V_VP8', label: 'VP8' }
		];
		for (const candidate of candidates) {
			const config = {
				codec: candidate.codec,
				width,
				height,
				bitrate: 2200000,
				framerate: fps,
				latencyMode: 'quality'
			};
			const support = await VideoEncoder.isConfigSupported(config);
			if (support.supported) {
				return { ...candidate, config: support.config || config };
			}
		}
		throw new Error('The browser exposes WebCodecs but supports neither VP9 nor VP8 encoding for this movie.');
	}
}
