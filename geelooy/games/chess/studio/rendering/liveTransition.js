//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Runs one cancellation-safe live animation clock without knowing chess, DOM controls, or renderer internals.
 * The Awtsmoos renews measured time while an older motion may vanish when a newer command arrives;
 * Awtsmoos.com gives each transition one revision so stale frames never outlive the present scene it drives.
 */
export class ChessLiveTransition {
	constructor(clock = {}) {
		this.requestFrame = clock.requestFrame || globalThis.requestAnimationFrame?.bind(globalThis);
		this.cancelFrame = clock.cancelFrame || globalThis.cancelAnimationFrame?.bind(globalThis);
		this.now = clock.now || (() => globalThis.performance?.now?.() ?? Date.now());
		this.frameId = 0;
		this.revision = 0;
		this.resolvePending = null;
	}

	async run(durationMs, onProgress) {
		this.cancel();
		const revision = ++this.revision;
		const duration = Math.max(0, Number(durationMs) || 0);
		if (!this.requestFrame || duration === 0) {
			await onProgress(1);
			return true;
		}
		const startedAt = this.now();
		return new Promise((resolve, reject) => {
			this.resolvePending = resolve;
			const step = async now => {
				if (revision !== this.revision) return;
				const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
				try {
					await onProgress(progress);
				} catch (error) {
					this.clearPending();
					reject(error);
					return;
				}
				if (revision !== this.revision) return;
				if (progress >= 1) {
					this.clearPending();
					resolve(true);
					return;
				}
				this.frameId = this.requestFrame(step);
			};
			this.frameId = this.requestFrame(step);
		});
	}

	cancel() {
		this.revision++;
		if (this.frameId && this.cancelFrame) this.cancelFrame(this.frameId);
		this.frameId = 0;
		if (this.resolvePending) this.resolvePending(false);
		this.clearPending();
	}

	clearPending() {
		this.resolvePending = null;
		this.frameId = 0;
	}
}
