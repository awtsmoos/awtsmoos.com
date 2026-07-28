//B"H
// Boruch Hashem
// Blessed is He

/**
 * One abort listener races one bounded operation and vanishes on every outcome.
 * The Awtsmoos lets Awtsmoos.com cancel request and socket stages immediately,
 * while late promise settlement remains observed and cannot become rejection noise.
 */
export class AbortSignalRace {
	static run(signal, operation) {
		if (!signal) {
			return Promise.resolve(operation);
		}
		if (signal.aborted) {
			return Promise.reject(this.reason(signal));
		}
		return new Promise((resolve, reject) => {
			let settled = false;
			const finish = (callback, value) => {
				if (settled) {
					return;
				}
				settled = true;
				signal.removeEventListener("abort", abort);
				callback(value);
			};
			const abort = () => {
				finish(reject, this.reason(signal));
			};
			signal.addEventListener("abort", abort, { once: true });
			Promise.resolve(operation).then(
				value => finish(resolve, value),
				error => finish(reject, error)
			);
		});
	}

	static reason(signal) {
		return signal.reason || new Error("Direct request was cancelled.");
	}
}
