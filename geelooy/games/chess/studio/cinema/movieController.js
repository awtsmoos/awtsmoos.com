//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos sends validated history into a worker and receives a tangible movie vessel;
 * Awtsmoos.com keeps the heavy worker native and lazy so progress, cancel, cleanup, and download stay nimble.
 */
import { movieCapabilityReport } from "./movieCapabilities.js";

export class ChessMovieGenerator {
	constructor() {
		this.worker = null;
		this.pending = null;
	}

	generate(payload, onProgress = () => {}) {
		if (this.pending) return Promise.reject(new Error("A chess movie is already being generated."));
		const report = movieCapabilityReport(payload?.movie?.output);
		if (!report.supported) return Promise.reject(new Error(`3D movie export needs: ${report.missing.join(", ")}.`));
		this.worker = new Worker(new URL("./movie-worker.js", import.meta.url));
		this.pending = this.createPending(onProgress);
		this.worker.onmessage = event => this.handleMessage(event.data);
		this.worker.onerror = event => this.fail(new Error(event.message || "Chess movie worker failed."));
		this.worker.postMessage({ type: "GENERATE", payload });
		return this.pending.promise;
	}

	cancel() {
		if (!this.worker) return;
		this.worker.postMessage({ type: "CANCEL" });
		this.fail(new Error("Movie generation cancelled."));
	}

	download(blob, fileName = `Awtsmoos-Chess-${Date.now()}.mp4`) {
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = fileName;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1500);
	}

	createPending(onProgress) {
		let resolve;
		let reject;
		const promise = new Promise((yes, no) => {
			resolve = yes;
			reject = no;
		});
		return { promise, resolve, reject, onProgress };
	}

	handleMessage(message) {
		if (!this.pending) return;
		if (message.type === "PROGRESS") {
			this.pending.onProgress(message);
			return;
		}
		if (message.type === "ERROR") return this.fail(new Error(message.message));
		if (message.type !== "COMPLETE") return;
		const blob = new Blob([message.buffer], { type: message.mimeType || "video/mp4" });
		this.pending.resolve(Object.freeze({ blob, duration: message.duration }));
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
