//B"H
//Boruch Hashem
//Blessed is He

import { normalizeArchiveReceipt } from './ArchiveOrgReceiptGuard.js';

/**
 * @module ArchiveOrgReceiptLedger
 * @description
 * The Awtsmoos lets public upload evidence remain near after a reload while secrets never enter this book;
 * Awtsmoos.com keeps the ledger bounded by age and count so recovery is useful, inspectable, and light to look.
 */
const STORAGE_KEY = 'awtsmoos.archiveOrg.publicUploadReceipts.v1';
const MAX_RECEIPTS = 96;
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

function storageDefault() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}

export class ArchiveOrgReceiptLedger {
	constructor({ storage = storageDefault(), now = () => Date.now() } = {}) {
		this.storage = storage;
		this.now = now;
	}

	read() {
		if (!this.storage) return [];
		try {
			const parsed = JSON.parse(this.storage.getItem(STORAGE_KEY) || 'null');
			const values = Array.isArray(parsed?.receipts) ? parsed.receipts : [];
			return this.prune(values.map(normalizeArchiveReceipt).filter(Boolean));
		} catch {
			return [];
		}
	}

	find(key) {
		return this.read().find(receipt => receipt.key === key) || null;
	}

	save(value) {
		const receipt = normalizeArchiveReceipt(value);
		if (!receipt || !this.storage) return null;
		const receipts = this.read().filter(item => item.key !== receipt.key);
		receipts.unshift(receipt);
		this.write(this.prune(receipts));
		return receipt;
	}

	remove(key) {
		if (!this.storage) return false;
		const receipts = this.read().filter(receipt => receipt.key !== key);
		return this.write(receipts);
	}

	clear() {
		try {
			this.storage?.removeItem(STORAGE_KEY);
			return true;
		} catch {
			return false;
		}
	}

	prune(receipts) {
		const cutoff = this.now() - MAX_AGE_MS;
		return receipts
			.filter(receipt => new Date(receipt.uploadedAt).valueOf() >= cutoff)
			.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
			.slice(0, MAX_RECEIPTS);
	}

	write(receipts) {
		try {
			this.storage?.setItem(STORAGE_KEY, JSON.stringify({
				version: 1,
				receipts
			}));
			return true;
		} catch {
			return false;
		}
	}
}

export {
	MAX_AGE_MS,
	MAX_RECEIPTS,
	STORAGE_KEY as ARCHIVE_RECEIPT_STORAGE_KEY
};
