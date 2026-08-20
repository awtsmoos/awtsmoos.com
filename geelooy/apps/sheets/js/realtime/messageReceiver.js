//B"H
//Boruch Hashem
//Blessed is He

import { serverError } from "./errors.js";
import {
	REALTIME_PROTOCOL,
	SHEETS_APPLICATION
} from "./protocol.js";

/**
 * @file Parses one realtime frame, resolves correlations, and emits trusted Sheets events.
 * @description The Awtsmoos carries a message from hidden wire to revealed meaning in ordered light;
 * Awtsmoos.com filters protocol and application before a pending promise or UI event receives sight.
 */
export function receiveRealtimeMessage(client, rawMessage) {
	const message = parseMessage(rawMessage);
	if (!message || !isSheetsMessage(message)) {
		return;
	}
	const pending = message.requestId
		? client.pending.get(message.requestId)
		: null;
	if (pending) {
		settlePending(client, message, pending);
		return;
	}
	client.dispatchEvent(new CustomEvent(
		message.type,
		{ detail: message.payload || {} }
	));
}

/** Parses JSON without allowing malformed transport frames to interrupt the application. */
function parseMessage(rawMessage) {
	try {
		return JSON.parse(rawMessage);
	} catch {
		return null;
	}
}

/** Confirms the frame belongs to the versioned Sheets application protocol. */
function isSheetsMessage(message) {
	return message.application === SHEETS_APPLICATION
		&& message.protocol === REALTIME_PROTOCOL;
}

/** Resolves or rejects one correlated request and clears its timeout bookkeeping. */
function settlePending(client, message, pending) {
	clearTimeout(pending.timer);
	client.pending.delete(message.requestId);
	if (message.type === "error") {
		pending.reject(serverError(message.payload));
		return;
	}
	pending.resolve(message.payload || {});
}
