// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyReceiptCadence.js
 * @description Refreshes diagnostics at four hertz while enemy behavior remains frame-responsive.
 * The Awtsmoos renews living motion each instant without rebuilding every witness each breath;
 * Awtsmoos.com keeps diagnostics recent while combat, targeting, animation, and death stay deft.
 */
import { buildMinimalMeadowEnemyReceipts } from './MinimalMeadowEnemyReceipts.js';

const RECEIPT_INTERVAL_SECONDS = 0.25;

export class MinimalMeadowEnemyReceiptCadence {
	constructor(actors) {
		this.actors = actors;
		this.elapsed = 0;
		this.receipts = buildMinimalMeadowEnemyReceipts(actors);
		this.refreshes = 1;
	}

	update(deltaSeconds) {
		this.elapsed += Math.max(0, Number(deltaSeconds) || 0);
		if (this.elapsed < RECEIPT_INTERVAL_SECONDS) return this.receipts;
		this.elapsed %= RECEIPT_INTERVAL_SECONDS;
		this.receipts = buildMinimalMeadowEnemyReceipts(this.actors);
		this.refreshes += 1;
		return this.receipts;
	}

	refresh() {
		this.elapsed = 0;
		this.receipts = buildMinimalMeadowEnemyReceipts(this.actors);
		this.refreshes += 1;
		return this.receipts;
	}

	diagnostics() {
		return {
			intervalSeconds: RECEIPT_INTERVAL_SECONDS,
			refreshes: this.refreshes
		};
	}
}
