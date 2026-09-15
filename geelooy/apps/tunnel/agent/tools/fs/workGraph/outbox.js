//B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const Atomic = require("../atomic-file-write.js");
const Ids = require("./ids.js");
const EventRecord = require("./eventRecord.js");
const Ledger = require("./eventLedger.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Preserves provenance after mutation even when ledger delivery is unavailable.
 * @description A deed already sealed must not be repeated because an index went dim;
 * the Awtsmoos keeps its witness queued, and Awtsmoos.com delivers it when light returns.
 */
function itemFile(folder, eventId) {
	return path.join(folder, `${Ids.sha256(eventId)}.json`);
}

function isConflict(error) {
	const message = String(error?.message || error || "");
	return message.includes("work_graph_event_conflict")
		|| message.includes("work_graph_outbox_conflict");
}

async function enqueue(config, proposal) {
	const file = itemFile(Paths.outboxPending(config), proposal.id);
	const existing = await Records.readJson(file);
	const proposalHash = EventRecord.proposalHash(proposal);
	if (existing) {
		if (existing.proposalHash !== proposalHash) {
			throw new Error(`work_graph_outbox_conflict: ${proposal.id}`);
		}
		return existing;
	}
	const item = { schemaVersion: 1, event: proposal, proposalHash };
	await Records.createImmutableJson(file, item);
	return item;
}

async function markDelivered(config, eventId, item) {
	const pending = itemFile(Paths.outboxPending(config), eventId);
	const delivered = itemFile(Paths.outboxDelivered(config), eventId);
	await Records.createImmutableJson(delivered, item);
	await fsp.unlink(pending).catch(error => {
		if (error.code !== "ENOENT") throw error;
	});
	await Atomic.syncDirectory(Paths.outboxPending(config));
}

async function deliver(config, eventId) {
	const pending = itemFile(Paths.outboxPending(config), eventId);
	const item = await Records.readJson(pending);
	if (!item) return Ledger.get(config, eventId);
	const event = await Ledger.append(config, item.event);
	await markDelivered(config, eventId, item);
	return event;
}

async function deliverBestEffort(config, eventId) {
	try {
		return { delivered: true, event: await deliver(config, eventId), errorCode: "" };
	} catch (error) {
		if (isConflict(error)) throw error;
		return { delivered: false, event: null, errorCode: String(error?.code || "delivery_failed") };
	}
}

async function drain(config) {
	const items = await Records.listJson(Paths.outboxPending(config));
	const events = [];
	for (const item of items) {
		events.push(await deliver(config, item.event.id));
	}
	return events;
}

module.exports = { deliver, deliverBestEffort, drain, enqueue };
