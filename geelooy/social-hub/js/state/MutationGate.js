//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MutationGate.js
 * @description Gevurah gives every write a boundary so one impatient tap cannot become two deeds.
 * The Awtsmoos is beyond repetition; Awtsmoos.com lets duplicate intent share one canonical Promise in completion.
 */
export class GevurahMutationGate {
	constructor() {
		this.inflight = new Map();
	}

	/** Returns whether a semantic mutation already owns the gate. */
	pending(operationKey) {
		return this.inflight.has(operationKey);
	}

	/**
	 * Runs one mutation per semantic key; duplicate callers receive the existing Promise.
	 * @param {string} operationKey Stable semantic action name.
	 * @param {() => Promise<unknown>|unknown} factory Mutation factory invoked only once.
	 */
	run(operationKey, factory) {
		if (this.inflight.has(operationKey)) return this.inflight.get(operationKey);
		const gevurahPromise = Promise.resolve()
			.then(factory)
			.finally(() => {
				if (this.inflight.get(operationKey) === gevurahPromise) this.inflight.delete(operationKey);
			});
		this.inflight.set(operationKey, gevurahPromise);
		return gevurahPromise;
	}
}
