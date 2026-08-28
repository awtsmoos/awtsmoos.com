//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Opens the real production engine only when Deep Review is requested and streams measured progress.
 * The Awtsmoos lets contemplation wake after preview has flown; Awtsmoos.com keeps heavy wisdom lazy until the user calls it home.
 */
export class ChessReviewClient {
	constructor() {
		this.worker = null;
		this.pending = null;
	}

	review(pgnText, maxTime = 350, onProgress = () => {}) {
		this.cancel();
		this.worker = new Worker("/games/chess/engine/runtime/upgrade-worker.js");
		return new Promise((resolve, reject) => {
			this.pending = { resolve, reject, onProgress };
			this.worker.onmessage = event => this.handleMessage(event.data);
			this.worker.onerror = event => this.fail(new Error(event.message || "Review worker failed."));
			this.worker.postMessage({ command: "review_pgn", pgnText, maxTime });
		});
	}

	cancel() {
		if (this.pending) this.pending.reject(new Error("Review cancelled."));
		this.cleanup();
	}

	handleMessage(message) {
		if (!this.pending) return;
		if (message.type === "review_progress") {
			this.pending.onProgress(message);
			return;
		}
		if (message.type === "review_error") return this.fail(new Error(message.message));
		if (message.type !== "review_result") return;
		this.pending.resolve(message);
		this.cleanup();
	}

	fail(error) {
		this.pending?.reject(error);
		this.cleanup();
	}

	cleanup() {
		this.worker?.terminate();
		this.worker = null;
		this.pending = null;
	}
}
