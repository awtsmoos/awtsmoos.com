// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { GlobalWebsiteAcceptedReceiptStore } from "./GlobalWebsiteAcceptedReceiptStore.mjs";

/**
 * @file Proves accepted stable-turn receipts are private, permanent, and write-once.
 * @description
 * The Awtsmoos remembers one accepted Send through a hash-named durable witness.
 * Awtsmoos.com reconstructs that witness after restart, refuses overwrite races,
 * and seals both directory and receipt with device-local private permissions.
 */
const ticketId = "ticket_0123456789abcdef0123456789abcdef";

function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-accepted-receipt-"));
}

function receipt(acceptedAt) {
	return {
		acceptedAt,
		conversationId: "opaque-conversation",
		userMessageId: "opaque-message",
		responseStatus: 200,
		closedAt: null
	};
}

test("a reconstructed store reads the same accepted receipt", () => {
	const rootPath = temporaryRoot();
	try {
		const first = new GlobalWebsiteAcceptedReceiptStore({ rootPath });
		first.write(ticketId, receipt(100));
		const second = new GlobalWebsiteAcceptedReceiptStore({ rootPath });
		assert.deepEqual(second.read(ticketId), receipt(100));
		assert.equal(second.count(), 1);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("a second writer cannot overwrite the first accepted testimony", () => {
	const rootPath = temporaryRoot();
	try {
		const store = new GlobalWebsiteAcceptedReceiptStore({ rootPath });
		assert.deepEqual(store.write(ticketId, receipt(100)), receipt(100));
		assert.deepEqual(store.write(ticketId, receipt(200)), receipt(100));
		assert.deepEqual(store.read(ticketId), receipt(100));
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("accepted receipts and their directory are private", () => {
	const rootPath = temporaryRoot();
	try {
		const store = new GlobalWebsiteAcceptedReceiptStore({ rootPath });
		store.write(ticketId, receipt(100));
		const receiptPath = store.receiptPath(ticketId);
		assert.equal(fs.statSync(store.rootPath).mode & 0o777, 0o700);
		assert.equal(fs.statSync(receiptPath).mode & 0o777, 0o600);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("invalid ticket names cannot escape the receipt directory", () => {
	const rootPath = temporaryRoot();
	try {
		const store = new GlobalWebsiteAcceptedReceiptStore({ rootPath });
		assert.equal(store.read("../../escape"), null);
		assert.throws(
			() => store.write("../../escape", receipt(100)),
			error => error.code === "invalid_website_turn_ticket_id"
		);
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
