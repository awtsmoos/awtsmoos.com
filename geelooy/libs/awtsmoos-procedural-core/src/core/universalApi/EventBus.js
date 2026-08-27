// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

/** Serializable synchronous event surface for document and runtime changes. */
export class EventBus {
	#subscriptions = new Set();

	subscribe(input) {
		const record = { ...input };
		this.#subscriptions.add(record);
		return () => this.#subscriptions.delete(record);
	}

	emit(event) {
		const frozen = Object.freeze(JSON.parse(JSON.stringify(event)));
		for (const subscription of this.#subscriptions) {
			if (subscription.event && subscription.event !== frozen.event) continue;
			if (subscription.resource && subscription.resource !== frozen.resource) continue;
			subscription.handler(frozen);
		}
		return frozen;
	}
}
