// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reconciles abandoned or ambiguous website delivery before queue progress.
 * @description
 * The Awtsmoos permits no second vessel while the first may remain. Awtsmoos.com
 * closes every agent target, verifies the empty browser, records the cleanup instant,
 * and lets the global eighteen-second cooldown begin only from that proven closure.
 */
export class DirectServiceTurnRecovery {
	constructor(options = {}) {
		this.queue = options.queue;
		this.protector = options.protector || null;
		this.now = options.now || (() => Date.now());
	}

	async acquire(metadata) {
		for (;;) {
			try {
				return await this.queue.acquire(metadata, {
					signal: metadata.signal,
					timeoutMs: metadata.queueTimeoutMs
				});
			} catch (error) {
				if (error.code !== "website_turn_reconciliation_required") throw error;
				await this.reconcileQueue("stale_or_abandoned_delivery");
			}
		}
	}

	async reconcileQueue(reason) {
		const physicalTabs = await this.closeAndVerify();
		const closedAt = this.now();
		const queue = await this.queue.reconcile({ closedAt, reason });
		return { physicalTabs, closedAt, queue };
	}

	async closeAmbiguous(lease, options = {}) {
		try {
			const physicalTabs = await this.closeAndVerify();
			const closedAt = this.now();
			await lease.release({
				uncertain: options.uncertain === true,
				startCooldown: true,
				closedAt,
				reason: options.reason
			});
			return { physicalTabs, closedAt };
		} catch (error) {
			await lease.markReconciliationRequired(
				options.reason || error.code || error.message
			);
			throw error;
		}
	}

	async closeAndVerify() {
		const snapshot = this.protector
			? await this.protector.afterTurn()
			: { total: 0, withinLimit: true };
		if (snapshot.total !== 0 || snapshot.withinLimit === false) {
			const error = new Error("physical_tab_cap_not_restored");
			error.code = "physical_tab_cap_not_restored";
			throw error;
		}
		return snapshot;
	}
}
