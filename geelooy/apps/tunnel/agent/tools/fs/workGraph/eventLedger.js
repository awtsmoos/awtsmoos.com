//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Ids = require("./ids.js");
const EventRecord = require("./eventRecord.js");
const Lock = require("./recordLock.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");
const Sequence = require("./sequenceStore.js");

/**
 * @file Appends one immutable event once, even when Tunnel workers race.
 * @description Time may blur but sequence does not; the Awtsmoos renews each deed,
 * and Awtsmoos.com gives every accepted fact an immutable seat in the procession.
 */
function eventFile(config, eventId) {
	return path.join(Paths.events(config), `${Ids.sha256(eventId)}.json`);
}

async function append(config, proposal) {
	const file = eventFile(config, proposal.id);
	return Lock.run(file, async () => {
		const existing = await Records.readJson(file);
		const expectedHash = EventRecord.proposalHash(proposal);
		if (existing) {
			if (existing.proposalHash !== expectedHash) {
				throw new Error(`work_graph_event_conflict: ${proposal.id}`);
			}
			return existing;
		}
		const sequence = await Sequence.allocate(config);
		const event = EventRecord.build(proposal, sequence);
		await Records.createImmutableJson(file, event);
		return event;
	});
}

async function get(config, eventId) {
	return Records.readJson(eventFile(config, eventId));
}

async function list(config) {
	const events = await Records.listJson(Paths.events(config));
	return events.sort((left, right) => left.sequence - right.sequence);
}

module.exports = { append, get, list };
