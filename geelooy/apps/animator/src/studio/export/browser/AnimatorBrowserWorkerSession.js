// B"H
// Boruch Hashem
// Blessed is He

/**
 * A narrow worker boundary carries only completed production pixels and sound.
 * The Awtsmoos renews each transferable vessel while Awtsmoos.com keeps all
 * anatomy, rigging, acting, and timeline evaluation on the authoritative side.
 */
export class AnimatorBrowserWorkerSession {
	static workerUrl = '/geelooy/apps/animator/tools/browser-export/animator-video-worker.js';

	static async render(payload, callbacks = {}) {
		const worker = new Worker(`${this.workerUrl}?bh=${Date.now()}`);
		const session = new this(worker, callbacks);
		try {
			await session.request('INIT', this.config(payload), 'READY');
			await payload.frameSource.prepare(payload.width, payload.height);
			const frameCount = Math.ceil(payload.durationSeconds * payload.fps);
			for (let index = 0; index < frameCount; index += 1) {
				await session.sendFrame(payload, index, frameCount);
			}
			return await session.finalize(payload, frameCount);
		} finally {
			worker.terminate();
		}
	}

	constructor(worker, callbacks) {
		this.worker = worker;
		this.callbacks = callbacks;
		this.pending = [];
		worker.onmessage = event => this.receive(event.data || {});
		worker.onerror = event => this.fail(new Error(event.message || 'MP4 worker failed.'));
	}

	async sendFrame(payload, index, frameCount) {
		const time = index / payload.fps;
		const bitmap = await payload.frameSource.capture(
			time * 1000,
			payload.width,
			payload.height
		);
		await this.request('FRAME', {
			bitmap,
			time,
			duration: 1 / payload.fps
		}, 'FRAME_ACCEPTED', [bitmap]);
		const completedFrames = index + 1;
		this.callbacks.onProgress?.({
			completedFrames,
			totalFrames: frameCount,
			percent: Math.round(completedFrames / frameCount * 100)
		});
	}

	finalize(payload, frameCount) {
		const channels = payload.audioBufferShim.channels;
		return this.request('FINALIZE', {
			audioBufferShim: payload.audioBufferShim,
			fileName: payload.fileName,
			durationSeconds: payload.durationSeconds,
			frameCount
		}, 'VIDEO_COMPLETE', channels.map(channel => channel.buffer));
	}

	request(type, payload, expectedType, transfer = []) {
		return new Promise((resolve, reject) => {
			this.pending.push({ expectedType, resolve, reject });
			this.worker.postMessage({ type, payload }, transfer);
		});
	}

	receive(message) {
		if (message.type === 'STATUS_UPDATE') {
			this.callbacks.onStatus?.(message.payload?.message);
			return;
		}
		if (message.type === 'FATAL_ERROR') {
			this.fail(new Error(message.payload?.message || 'MP4 worker failed.'));
			return;
		}
		const index = this.pending.findIndex(item => item.expectedType === message.type);
		if (index >= 0) {
			this.pending.splice(index, 1)[0].resolve(message.payload);
		}
	}

	fail(error) {
		this.pending.splice(0).forEach(item => item.reject(error));
	}

	static config(payload) {
		return {
			resolution: { width: payload.width, height: payload.height },
			outputFormat: { fps: payload.fps, quality: payload.quality },
			maxCacheFrames: payload.maxCacheFrames
		};
	}
}
