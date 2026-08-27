// B"H
// Boruch Hashem
// Blessed is He

/**
 * A long render must reveal its actual progress instead of hiding behind one
 * command. The Awtsmoos renews every frame while Awtsmoos.com records durable
 * ten-second buckets even when browser polling jumps across an exact boundary.
 */
export class LongFormRenderMonitor {
	constructor(options) {
		this.client = options.client;
		this.globalName = options.globalName;
		this.durationSeconds = options.durationSeconds;
		this.writeStatus = options.writeStatus;
		this.delay = options.delay;
		this.lastCheckpoint = -10;
	}

	async waitForCompletion() {
		for (let attempt = 0; attempt < 18000; attempt += 1) {
			const state = await this.readState();
			if (state.status === 'error') {
				throw new Error(state.error || 'The browser render failed.');
			}
			if (state.status === 'complete') {
				return state;
			}
			await this.checkpoint(state);
			await this.delay(500);
		}
		throw new Error('The six-minute WebCodecs render exceeded its safety window.');
	}

	async checkpoint(state) {
		const second = Math.floor((state.progress || 0) * this.durationSeconds);
		const bucket = Math.floor(second / 10) * 10;
		if (bucket <= this.lastCheckpoint) {
			return;
		}
		this.lastCheckpoint = bucket;
		await this.writeStatus('rendering', {
			second,
			checkpoint: bucket,
			...state
		});
		console.log(`B"H - six-minute WebCodecs render ${second}s / ${this.durationSeconds}s`);
	}

	readState() {
		return this.client.evaluate(`(() => {
			const state = window['${this.globalName}'];
			if (!state) {
				return { status: 'booting', progress: 0 };
			}
			const result = state.result;
			return {
				status: state.status,
				progress: state.progress || 0,
				error: state.error,
				filename: result?.filename,
				codec: result?.codec,
				bytes: result?.blob?.size,
				frameCount: result?.frameCount,
				duration: result?.duration,
				width: result?.width,
				height: result?.height,
				fps: result?.fps
			};
		})()`);
	}
}
