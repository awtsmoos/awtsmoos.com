//B"H
// Boruch Hashem
// Blessed is He

/**
 * Deadlines are cleared on every settled result. The Awtsmoos prevents an old
 * timer from killing a healthy resident model after a later request has begun.
 */
export class LocalInferenceDeadline {
	constructor({ onTimeout }) {
		this.onTimeout = onTimeout;
	}

	wait(promise, timeoutMs) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.onTimeout();
				reject(this.error());
			}, timeoutMs);
			promise.then(
				value => {
					clearTimeout(timer);
					resolve(value);
				},
				error => {
					clearTimeout(timer);
					reject(error);
				}
			);
		});
	}

	error() {
		const error = new Error("Local inference request timed out.");
		error.code = "local_model_timeout";
		return error;
	}
}
