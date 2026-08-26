//B"H
// Boruch Hashem
// Blessed is He

const { mutateStore, readStore } = require("../store.js");
const Id = require("../tunnelSecurity/identifiers.js");
const Audit = require("./protocolAudit.js");
const DeviceIdentity = require("./deviceIdentity.js");
const Envelope = require("./envelope.js");
const Limits = require("./limits.js");
const Relationship = require("./relationshipStore.js");
const Retention = require("./mailboxRetention.js");

/**
 * @file Bounded durable inbox for explicitly accepted cross-device messages.
 * @description
 * The Awtsmoos lets a word travel without losing who spoke or who consented to hear.
 * Awtsmoos.com rechecks every send, refuses full vessels instead of discarding living
 * messages, and lets only the owning target acknowledge finite testimony in rhyme.
 */

function send(accountId, input = {}) {
	let result = { ok: false, error: "device_protocol_denied" };
	mutateStore(store => {
		const validation = Envelope.validateInput(input);
		if (!validation.ok) {
			result = validation;
			return store;
		}
		const relationship = Relationship.authorize(
			accountId,
			input.relationshipId,
			validation.capability,
			store
		);
		if (!relationship) {
			return store;
		}
		Retention.prune(store);
		const key = mailboxKey(relationship.targetAccountId, relationship.targetDeviceId);
		const mailbox = store.deviceProtocolMailboxes[key] || [];
		if (mailbox.length >= Limits.LIMIT.MAX_MESSAGES_PER_MAILBOX) {
			result = { ok: false, error: "device_protocol_mailbox_full" };
			return store;
		}
		if (Retention.messageCount(store) >= Limits.LIMIT.MAX_MESSAGES_GLOBAL) {
			result = { ok: false, error: "device_protocol_capacity_reached" };
			return store;
		}
		store.deviceProtocolSequence = Number(store.deviceProtocolSequence || 0) + 1;
		const built = Envelope.create(relationship, input, store.deviceProtocolSequence);
		mailbox.push(built.message);
		store.deviceProtocolMailboxes[key] = mailbox;
		Audit.appendAudit(store, messageAudit("send", accountId, built.message));
		result = { ok: true, message: built.message };
		return store;
	});
	return result;
}

function list(accountId, targetDeviceId, store = readStore()) {
	const device = DeviceIdentity.ownedDevice(accountId, targetDeviceId, store);
	if (!device) {
		return null;
	}
	const key = mailboxKey(accountId, device.deviceId);
	const values = store.deviceProtocolMailboxes?.[key] || [];
	return values.filter(message => !Limits.isExpired(message.expiresAt));
}

function acknowledge(accountId, input = {}) {
	let result = false;
	mutateStore(store => {
		const device = DeviceIdentity.ownedDevice(accountId, input.targetDeviceId, store);
		if (!device) {
			return store;
		}
		const key = mailboxKey(accountId, device.deviceId);
		const values = store.deviceProtocolMailboxes[key] || [];
		const index = values.findIndex(item => item.messageId === input.messageId);
		if (index < 0) {
			return store;
		}
		const [message] = values.splice(index, 1);
		if (!values.length) {
			delete store.deviceProtocolMailboxes[key];
		}
		Audit.appendAudit(store, messageAudit("ack", accountId, message));
		result = true;
		return store;
	});
	return result;
}

function mailboxKey(accountId, deviceId) {
	return Id.registryKey(accountId, deviceId);
}

function messageAudit(action, accountId, message) {
	return {
		action: `device.message.${action}`,
		accountId,
		messageId: message.messageId,
		relationshipId: message.relationshipId,
		sourceDeviceId: message.sourceDeviceId,
		targetDeviceId: message.targetDeviceId,
		result: "allowed"
	};
}

module.exports = { acknowledge, list, mailboxKey, send };
