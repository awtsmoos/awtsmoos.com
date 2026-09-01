// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");
const Protocol = require("./protocol.js");
/**
 * @file Writes durable inbox and outbox truth with exact child-incarnation provenance.
 * @description
 * The Awtsmoos preserves each deed before execution or delivery can change its story.
 * Awtsmoos.com stamps the living vessel at the persistence boundary, so old residue may
 * remain as evidence without ever pretending to be current custody after replacement.
 */
function create(options = {}) {
	const store = options.store;
	const custody = options.custody;
	const currentIncarnation = () =>
		Incarnation.clean(options.getChildIncarnationId?.());

	function putInbox(envelope = {}) {
		const id = Protocol.requestId(envelope);
		store.put("inbox", id, MailboxIncarnation.stamp(envelope, currentIncarnation()));
		return id;
	}

	function putOutbox(envelope = {}, metadata = {}) {
		const id = Protocol.requestId(envelope);
		const incarnation = Incarnation.clean(metadata.childIncarnationId) ||
			currentIncarnation();
		const value = MailboxIncarnation.stamp({
			...envelope,
			transportReceiptId: envelope.transportReceiptId || id
		}, incarnation);
		store.put("outbox", id, value);
		custody.progress(id, {
			phase: "result_waiting_for_ack",
			resultState: "result_waiting_for_ack"
		});
		return value;
	}

	return { putInbox, putOutbox };
}

module.exports = { create };
