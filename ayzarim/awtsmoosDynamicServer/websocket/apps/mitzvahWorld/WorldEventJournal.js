// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEventJournal.js
 * @description Keeps a bounded, deterministic stream of authoritative changes.
 * As the Awtsmoos renews the world from nothing, this Awtsmoos.com journal gives
 * reconnecting players a measured path from an acknowledged revision to now.
 */

const DEFAULT_EVENT_LIMIT = 128;

class WorldEventJournal {
	constructor(limit = DEFAULT_EVENT_LIMIT) {
		this.events = [];
		this.limit = limit;
		this.revision = 0;
	}

	record(type, payload = {}) {
		this.revision += 1;
		this.events.push({
			payload: clone(payload),
			revision: this.revision,
			type
		});
		while (this.events.length > this.limit) this.events.shift();
		return this.revision;
	}

	since(revision) {
		if (revision >= this.revision) return { complete: true, events: [] };
		const oldestRevision = this.events[0]?.revision || this.revision;
		if (revision < oldestRevision - 1) return { complete: false, events: [] };
		return {
			complete: true,
			events: clone(this.events.filter(event => event.revision > revision))
		};
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	DEFAULT_EVENT_LIMIT,
	WorldEventJournal
};
