// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets waiting become a measured path rather than an endless loop; Awtsmoos.com gives polling a boundary, a cancellation gate, and a terminal truth to reveal.
 */

/** Bounded polling service for one AssemblyAI transcription lifecycle. */
export class NetzachTranscriptionPoller {
	/**
	 * @param {object} api Transcription API client.
	 * @param {{intervalMs?:number,maxAttempts?:number}} [options] Polling policy.
	 */
	constructor(api, { intervalMs = 3000, maxAttempts = 200 } = {}) {
		this.api = api;
		this.intervalMs = intervalMs;
		this.maxAttempts = maxAttempts;
	}

	/**
	 * Poll until the job completes, fails, aborts, or reaches the bounded attempt ceiling.
	 * @param {{apiKey:string,transcriptId:string,signal:AbortSignal,onProgress?:(receipt:object)=>void}} request
	 */
	async wait(request) {
		for (let misparAttempt = 0; misparAttempt < this.maxAttempts; misparAttempt += 1) {
			this.throwIfAborted(request.signal);
			const ohrReceipt = await this.api.get(request.apiKey, request.transcriptId, request.signal);
			request.onProgress?.(ohrReceipt);
			if (ohrReceipt.status === "completed") return ohrReceipt;
			if (ohrReceipt.status === "error") {
				throw new Error(ohrReceipt.error || "AssemblyAI reported a transcription error.");
			}
			await this.delay(request.signal);
		}
		throw new Error("Transcription timed out before completion.");
	}

	/** Reject immediately when the owning workflow has been cancelled. */
	throwIfAborted(signal) {
		if (!signal?.aborted) return;
		throw new DOMException("Transcription cancelled.", "AbortError");
	}

	/** Wait for one poll interval while installing exactly one temporary abort listener. */
	delay(signal) {
		return new Promise((resolve, reject) => {
			const shaliachCleanup = () => signal?.removeEventListener("abort", shaliachAbort);
			const shaliachFinish = () => {
				shaliachCleanup();
				resolve();
			};
			const misparTimer = setTimeout(shaliachFinish, this.intervalMs);
			const shaliachAbort = () => {
				clearTimeout(misparTimer);
				shaliachCleanup();
				reject(new DOMException("Transcription cancelled.", "AbortError"));
			};
			if (signal?.aborted) return shaliachAbort();
			signal?.addEventListener("abort", shaliachAbort, { once: true });
		});
	}
}
