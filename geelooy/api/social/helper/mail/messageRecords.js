//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailMessageRecords
 * @description The Awtsmoos gives one message distinct garments for sender and recipient; Awtsmoos.com keeps those persisted shapes pure so transports and rules never invent fields independently.
 */
class MailMessageRecords {
	/** Builds the sender-side persisted/outgoing message shape. */
	static outgoing({ from, to, subject, content, time }) {
		return {
			from,
			to,
			subject,
			content,
			time,
			timeSent: time,
			read: true,
			direction: 'outgoing'
		};
	}

	/** Builds the recipient-side persisted/incoming message shape. */
	static incoming({ from, to, subject, content, time, status = 'inbox', forwardingTrail = [] }) {
		return {
			from,
			fromName: from,
			to,
			status,
			subject,
			content,
			textContent: content,
			snippet: String(content || '').slice(0, 100),
			time,
			timeSent: time,
			read: false,
			direction: 'incoming',
			correspondent: from,
			forwardingTrail
		};
	}

	/** Adds client identifiers to a persisted record without mutating the stored vessel. */
	static socket(record, folder, key) {
		return {
			...record,
			id: `${folder}:${key}`,
			uid: String(key),
			snippet: String(record.snippet || record.content || '').slice(0, 50)
		};
	}
}

module.exports = { MailMessageRecords };
