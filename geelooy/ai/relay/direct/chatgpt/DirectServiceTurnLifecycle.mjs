// B"H
// Boruch Hashem
// Blessed is He

import { codedError } from "./DirectServiceTurnPresentation.mjs";

/**
 * @file Owns one direct website turn from claim through terminal browser cleanup.
 * @description
 * The Awtsmoos distinguishes claim, activation, acceptance, closure, and ambiguity.
 * Awtsmoos.com persists each boundary, quarantines uncertain Send outcomes, and
 * exposes one compact lifecycle state for honest success and failure presentation.
 */
export class DirectServiceTurnLifecycle {
	constructor(options = {}) {
		this.lease = options.lease;
		this.protector = options.protector || null;
		this.recovery = options.recovery;
		this.submissionStarted = false;
		this.submissionAccepted = false;
		this.released = false;
		this.held = false;
		this.uncertain = false;
		this.physicalTabs = null;
		this.closeReceipt = null;
	}

	async beforeTurn() {
		this.physicalTabs = await this.protector?.beforeTurn() || null;
		return this.physicalTabs;
	}

	callbacks() {
		return {
			onSubmissionStarted: receipt => this.markStarted(receipt),
			onSubmissionAccepted: receipt => this.markAccepted(receipt),
			onTabClosed: receipt => this.closeVerified(receipt)
		};
	}

	async markStarted(receipt) {
		await this.lease.markDeliveryStarted(receipt);
		this.submissionStarted = true;
	}

	async markAccepted(receipt) {
		await this.lease.markAccepted(receipt);
		this.submissionAccepted = true;
	}

	async closeVerified(receipt) {
		if (receipt.tabClose?.verified !== true) throw codedError("tab_close_not_verified");
		this.physicalTabs = await this.protector?.afterTurn() || {
			total: 0,
			withinLimit: true
		};
		if (this.physicalTabs.total !== 0 || this.physicalTabs.withinLimit === false) {
			throw codedError("physical_tab_cap_not_restored");
		}
		this.uncertain = receipt.submissionUncertain === true;
		const releaseOptions = {
			startCooldown: true,
			closedAt: receipt.closedAt
		};
		if (this.uncertain) {
			releaseOptions.uncertain = true;
			releaseOptions.reason = "accepted_receipt_persistence_failed";
		}
		await this.lease.release(releaseOptions);
		this.released = true;
		this.closeReceipt = receipt;
		return {
			physicalTabs: this.physicalTabs,
			cooldownStartedAt: receipt.closedAt
		};
	}

	assertTerminal() {
		if (this.submissionStarted && !this.released) {
			throw codedError("tab_close_receipt_required");
		}
	}

	async releaseUnused() {
		if (this.released) return;
		await this.lease.release({ startCooldown: false });
		this.released = true;
	}
	async recoverFailure(error) {
		if (this.released) return;
		const ambiguous = this.submissionStarted || error.submissionAccepted === true;
		if (!ambiguous) return this.releaseUnused();
		this.uncertain = !this.submissionAccepted;
		try {
			const cleanup = await this.recovery.closeAmbiguous(this.lease, {
				uncertain: this.uncertain,
				reason: error.code || error.message
			});
			this.physicalTabs = cleanup.physicalTabs;
			this.closeReceipt = {
				closedAt: cleanup.closedAt,
				tabClose: { verified: true },
				recovery: true
			};
			this.released = true;
		} catch (cleanupError) {
			this.held = true;
			error.cleanupError = cleanupError.code || cleanupError.message;
		}
	}
	context() {
		return {
			lease: this.lease,
			physicalTabs: this.physicalTabs,
			closeReceipt: this.closeReceipt,
			held: this.held,
			uncertain: this.uncertain
		};
	}
}
