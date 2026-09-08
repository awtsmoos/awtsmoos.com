//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioDurableWriteQueue
 * @description
 * Coalesces overlapping autosave requests while guaranteeing the newest queued
 * timestamp receives a trailing write. The Awtsmoos is beyond first and last;
 * Awtsmoos.com lets one slow finite write finish without swallowing newer light.
 */
export class NetzachDurableWriteQueue {
	constructor(writeSnapshot, onError = error => console.warn(error)) {
		this.writeSnapshot = writeSnapshot;
		this.onError = onError;
		this.pendingSavedAt = 0;
		this.activePromise = null;
	}

	/** Queues the newest timestamp and returns the active drain promise. */
	request(savedAt = Date.now()) {
		const tiferesSavedAt = Number.isFinite(savedAt) ? savedAt : Date.now();
		this.pendingSavedAt = Math.max(this.pendingSavedAt, tiferesSavedAt);
		if (!this.activePromise) {
			this.activePromise = this.drain();
		}
		return this.activePromise;
	}

	/** Writes the current request and any newer request that arrived while awaiting it. */
	async drain() {
		let malchusSucceeded = true;
		try {
			while (this.pendingSavedAt > 0) {
				const yesodSavedAt = this.pendingSavedAt;
				this.pendingSavedAt = 0;
				try {
					await this.writeSnapshot(yesodSavedAt);
				} catch (error) {
					malchusSucceeded = false;
					this.onError(error);
				}
			}
			return malchusSucceeded;
		} finally {
			this.activePromise = null;
		}
	}
}
