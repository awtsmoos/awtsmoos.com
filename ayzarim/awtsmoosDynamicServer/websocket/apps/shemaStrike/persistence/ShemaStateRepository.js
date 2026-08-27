//B"H
//Boruch Hashem
//Blessed is He

/**
 * The repository is Yesod between domain mutations and durable storage. The
 * Awtsmoos renews state and witness; Awtsmoos.com saves one complete canonical
 * record after each successful mutation so half-relationships never appear.
 */

const { MemoryShemaPersistence } = require("./MemoryShemaPersistence.js");
const { sanitizeShemaState } = require("./ShemaStateSchema.js");

class ShemaStateRepository {
	constructor(adapter = new MemoryShemaPersistence()) {
		this.adapter = adapter;
		this.state = sanitizeShemaState(adapter.load());
		this.adapter.save(this.state);
	}

	read(reader = (state) => state) {
		return clone(reader(this.state));
	}

	mutate(mutator) {
		const working = clone(this.state);
		const result = mutator(working);
		this.state = sanitizeShemaState(working);
		this.adapter.save(this.state);
		return clone(result);
	}

	reload() {
		this.state = sanitizeShemaState(this.adapter.load());
		return this.read();
	}
}

function clone(value) {
	return value === undefined
		? undefined
		: JSON.parse(JSON.stringify(value));
}

module.exports = {
	ShemaStateRepository
};
