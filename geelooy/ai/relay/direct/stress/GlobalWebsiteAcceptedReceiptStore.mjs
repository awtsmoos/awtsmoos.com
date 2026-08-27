// B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Preserves accepted stable-turn identities beyond bounded queue memory.
 * @description
 * The Awtsmoos remembers every accepted Send without crowding the active state.
 * Awtsmoos.com publishes one private hash-named receipt through atomic create-only
 * linkage, so no reconnect, race, cache pruning, or restart can authorize replay.
 */
export class GlobalWebsiteAcceptedReceiptStore {
	constructor(options = {}) {
		this.rootPath = path.join(options.rootPath, "accepted");
		fs.mkdirSync(this.rootPath, { recursive: true, mode: 0o700 });
	}

	read(ticketId) {
		const receiptPath = this.receiptPath(ticketId);
		if (!receiptPath) return null;
		try {
			const value = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
			return value?.acceptedAt ? value : null;
		} catch {
			return null;
		}
	}

	write(ticketId, receipt) {
		const receiptPath = this.receiptPath(ticketId);
		if (!receiptPath) throw codedError("invalid_website_turn_ticket_id");
		const existing = this.read(ticketId);
		if (existing) return existing;
		const temporary = this.temporaryPath(receiptPath);
		this.writeTemporary(temporary, receipt);
		try {
			fs.linkSync(temporary, receiptPath);
			fs.chmodSync(receiptPath, 0o600);
			return receipt;
		} catch (error) {
			if (error.code !== "EEXIST") throw error;
			const recovered = this.read(ticketId);
			if (recovered) return recovered;
			throw codedError("accepted_receipt_exists_but_is_unreadable");
		} finally {
			fs.rmSync(temporary, { force: true });
		}
	}

	count() {
		try {
			return fs.readdirSync(this.rootPath)
				.filter(name => /^ticket_[a-f0-9]{32}\.json$/.test(name))
				.length;
		} catch {
			return 0;
		}
	}

	receiptPath(ticketId) {
		const value = String(ticketId || "");
		if (!/^ticket_[a-f0-9]{32}$/.test(value)) return null;
		return path.join(this.rootPath, `${value}.json`);
	}

	temporaryPath(receiptPath) {
		return `${receiptPath}.tmp-${process.pid}-${randomUUID()}`;
	}

	writeTemporary(temporary, receipt) {
		const descriptor = fs.openSync(temporary, "wx", 0o600);
		try {
			fs.writeFileSync(descriptor, `${JSON.stringify(receipt, null, 2)}\n`);
			fs.fsyncSync(descriptor);
		} finally {
			fs.closeSync(descriptor);
		}
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
