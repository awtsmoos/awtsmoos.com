//B"H
// Boruch Hashem
// Blessed is He

/**
 * The eight-gigabyte Mac runs exactly one model process at a time. The Awtsmoos
 * turns concurrency into a quiet promise chain so memory remains bounded and a
 * failed request cannot poison the requests waiting behind it.
 */
export class LocalInferenceQueue {
	constructor() {
		this.tail = Promise.resolve();
		this.pending = 0;
	}

	run(operation) {
		this.pending += 1;
		const current = this.tail.then(operation, operation);
		this.tail = current.catch(() => undefined).finally(() => {
			this.pending -= 1;
		});
		return current;
	}

	status() {
		return { pending: this.pending };
	}
}
