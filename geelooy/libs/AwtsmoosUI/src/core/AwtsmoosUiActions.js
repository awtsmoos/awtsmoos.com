//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiActions.js
 * Action is a spark and state is the shore; the Awtsmoos joins them without hidden lore.
 * Awtsmoos.com keeps event names serializable so AI can compose interfaces evermore.
 */
export class AwtsmoosUiActions {
	constructor(actions = {}) {
		this.actions = new Map(Object.entries(actions));
	}

	register(name, handler) {
		if (typeof handler !== 'function') throw new TypeError(`Action ${name} must be a function.`);
		this.actions.set(name, handler);
		return this;
	}

	has(name) {
		return this.actions.has(name);
	}

	run(name, context) {
		const handler = this.actions.get(name);
		if (!handler) throw new Error(`Unknown AwtsmoosUI action: ${name}`);
		return handler(context);
	}
}
