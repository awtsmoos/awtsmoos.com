// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyAdventureReceiptBridge.js
 * @description Advances canonical adventures exactly once from stable enemy defeat receipts.
 * The Awtsmoos remembers one true victory without multiplying its light;
 * Awtsmoos.com turns creature identity into Shlichus progress while bounded memory guards the gate.
 */

import {
	enemyDefeatAdventureEvent
} from '../world/enemy/EnemyAdventureEvent.js';

const DEFAULT_RECEIPT_LIMIT = 128;

export class EnemyAdventureReceiptBridge {
	constructor(options) {
		this.adventures = options.adventures;
		this.bus = options.bus;
		this.receiptLimit = options.receiptLimit || DEFAULT_RECEIPT_LIMIT;
		this.receipts = new Set();
		this.receiptOrder = [];
		this.unsubscribe = this.bus?.on?.(
			'enemy:defeated',
			detail => this.receiveDefeat(detail)
		);
	}

	receiveDefeat(detail = {}) {
		const defeatReceipt = String(detail.defeatReceipt || '');
		if (!defeatReceipt) {
			return this.reject('defeat-receipt-required', null);
		}
		if (this.receipts.has(defeatReceipt)) {
			return this.reject(
				'adventure-defeat-already-recorded',
				defeatReceipt
			);
		}
		const event = enemyDefeatAdventureEvent(detail);
		if (!event) return this.reject('creature-type-required', defeatReceipt);
		if (!this.adventures?.recordEvent) {
			return this.reject('adventure-store-required', defeatReceipt);
		}
		const before = stateSignature(this.adventures);
		const snapshot = this.adventures.recordEvent(event);
		const advanced = stateSignature(this.adventures) !== before;
		this.remember(defeatReceipt);
		return this.publish({
			accepted: true,
			advanced,
			defeatReceipt,
			event,
			snapshot
		});
	}

	reject(reason, defeatReceipt) {
		return this.publish({
			accepted: false,
			advanced: false,
			defeatReceipt,
			reason
		});
	}

	publish(receipt) {
		const frozen = Object.freeze(receipt);
		this.bus?.emit?.('adventure:defeat-receipt', frozen);
		return frozen;
	}

	remember(receipt) {
		this.receipts.add(receipt);
		this.receiptOrder.push(receipt);
		while (this.receiptOrder.length > this.receiptLimit) {
			this.receipts.delete(this.receiptOrder.shift());
		}
	}

	snapshot() {
		return {
			receiptCount: this.receipts.size,
			receiptLimit: this.receiptLimit
		};
	}

	destroy() {
		this.unsubscribe?.();
		this.receipts.clear();
		this.receiptOrder.length = 0;
	}
}

function stateSignature(adventures) {
	if (typeof adventures.serialize === 'function') {
		return JSON.stringify(adventures.serialize());
	}
	return JSON.stringify(adventures.snapshot?.() || null);
}
