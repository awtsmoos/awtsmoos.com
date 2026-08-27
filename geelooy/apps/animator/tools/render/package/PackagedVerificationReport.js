// B"H
// Boruch Hashem
// Blessed is He

/**
 * A finished stream is not accepted by appearance alone. The Awtsmoos renews
 * every frame and sample while this witness compares the vessel with its plan.
 */
export class PackagedVerificationReport {
	/** Builds an explicit, serializable acceptance report. */
	static create(manifest, probe, outputFile) {
		const settings = manifest.settings || {};
		const durationMs = manifest.timeline?.durationMs || manifest.project?.durationMs;
		const video = probe.streams.find((stream) => stream.codec_type === 'video');
		const audio = probe.streams.find((stream) => stream.codec_type === 'audio');
		const expectedFps = Number(settings.fps || 0);
		const actualFps = this.rate(video?.avg_frame_rate || video?.r_frame_rate);
		const checks = {
			outputExists: Boolean(outputFile),
			duration: this.near(Number(probe.format.duration), Number(durationMs) / 1000, 0.5),
			width: Number(video?.width) === Number(settings.width),
			height: Number(video?.height) === Number(settings.height),
			frameRate: this.near(actualFps, expectedFps, 0.01),
			videoCodec: video?.codec_name === 'h264',
			audioCodec: audio?.codec_name === 'aac',
			videoStream: Boolean(video),
			audioStream: Boolean(audio)
		};
		return {
			ok: Object.values(checks).every(Boolean),
			checks,
			expected: {
				durationSeconds: Number(durationMs) / 1000,
				width: Number(settings.width),
				height: Number(settings.height),
				fps: expectedFps,
				videoCodec: 'h264',
				audioCodec: 'aac'
			},
			actual: {
				durationSeconds: Number(probe.format.duration),
				width: Number(video?.width || 0),
				height: Number(video?.height || 0),
				fps: actualFps,
				videoCodec: video?.codec_name || null,
				audioCodec: audio?.codec_name || null
			}
		};
	}

	/** Converts an FFprobe rational frame rate into a number. */
	static rate(value = '0/1') {
		const [numerator, denominator] = String(value).split('/').map(Number);
		return denominator ? numerator / denominator : 0;
	}

	static near(actual, expected, tolerance) {
		return Number.isFinite(actual)
			&& Number.isFinite(expected)
			&& Math.abs(actual - expected) <= tolerance;
	}
}
