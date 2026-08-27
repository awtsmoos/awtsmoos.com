// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews one integer of revealed light without mixing it with the page; on Awtsmoos.com state stays pure so any future view may receive the same measured ray.
 */

/** Own the ephemeral nonnegative light count and publish explicit change receipts. */
export class OhrLightCounterState {
	/**
	 * @param {number} [initialValue=0] Initial nonnegative integer value.
	 */
	constructor(initialValue = 0) {
		this.value = this.normalize(initialValue);
		this.listeners = new Set();
	}

	/** @returns {number} Current count without exposing mutation. */
	get currentValue() {
		return this.value;
	}

	/** Increment by one and publish the resulting receipt. */
	increment() {
		this.value += 1;
		return this.publish("increment");
	}

	/** Reset to zero and publish only when state actually changed. */
	reset() {
		if (this.value === 0) return this.createReceipt("idle");
		this.value = 0;
		return this.publish("reset");
	}

	/**
	 * Subscribe to future changes and immediately reveal current truth.
	 * @param {(receipt:{value:number,reason:string})=>void} listener State observer.
	 * @returns {() => void} Unsubscribe function.
	 */
	subscribe(listener) {
		if (typeof listener !== "function") throw new TypeError("Light counter listener must be a function.");
		this.listeners.add(listener);
		listener(this.createReceipt("initial"));
		return () => this.listeners.delete(listener);
	}

	/** Notify every current listener with one immutable receipt. */
	publish(reason) {
		const receipt = this.createReceipt(reason);
		for (const listener of this.listeners) listener(receipt);
		return receipt;
	}

	/** @returns {{value:number,reason:string}} Frozen state receipt. */
	createReceipt(reason) {
		return Object.freeze({ value: this.value, reason });
	}

	/** Normalize external input into the state's nonnegative integer invariant. */
	normalize(value) {
		const number = Number(value);
		if (!Number.isFinite(number)) return 0;
		return Math.max(0, Math.floor(number));
	}
}
