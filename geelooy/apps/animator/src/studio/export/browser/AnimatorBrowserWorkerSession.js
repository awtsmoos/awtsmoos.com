// B"H
// Boruch Hashem
// Blessed is He

/**
 * The worker boundary carries one serialized movie and transferable soundtrack.
 * The Awtsmoos renews status, progress, completion, and failure while
 * Awtsmoos.com terminates every worker cleanly after its browser MP4 is born.
 */
export class AnimatorBrowserWorkerSession {
	static workerUrl = '/geelooy/apps/animator/tools/browser-export/animator-video-worker.js';

	static render(payload, callbacks = {}) {
		return new Promise((resolve, reject) => {
			const worker = new Worker(`${this.workerUrl}?bh=${Date.now()}`);
			let settled = false;
			const finish = action => {
				if (settled) {
					return;
				}
				settled = true;
				worker.terminate();
				action();
			};

			worker.onmessage = event => {
				const { type, payload: message } = event.data || {};
				if (type === 'STATUS_UPDATE') {
					callbacks.onStatus?.(message.message);
					return;
				}
				if (type === 'RENDER_PROGRESS') {
					callbacks.onProgress?.(message);
					return;
				}
				if (type === 'FATAL_ERROR') {
					finish(() => reject(new Error(message.message)));
					return;
				}
				if (type === 'VIDEO_COMPLETE') {
					finish(() => resolve(message));
				}
			};

			worker.onerror = event => {
				finish(() => reject(new Error(event.message || 'Browser export worker failed.')));
			};

			const transfer = payload.audioBufferShim.channels.map(channel => channel.buffer);
			worker.postMessage({
				type: 'START_EXPORT',
				payload
			}, transfer);
		});
	}
}
