// B"H
// Boruch Hashem
// Blessed is He

import {
	acceptedTurnError,
	admitTicket,
	decideTicket,
	reconciliationError,
	uncertainTurnError
} from "./GlobalWebsiteQueueAdmission.mjs";
import { publicWebsiteLease } from "./GlobalWebsiteQueueLease.mjs";
import { reconcileQueueState } from "./GlobalWebsiteQueueReconciliation.mjs";
import { GlobalWebsiteQueueStore } from "./GlobalWebsiteQueueStore.mjs";
import {
	createTicket,
	queueConfiguration,
	queueError
} from "./GlobalWebsiteQueuePolicy.mjs";
import { queueSnapshot } from "./GlobalWebsiteQueueSnapshot.mjs";
import * as Support from "./GlobalWebsiteTurnQueueSupport.mjs";

/**
 * @file Coordinates durable website turns through one host-global physical lane.
 * @description
 * The Awtsmoos welcomes unbounded logical descendants without multiplying browser vessels.
 * Awtsmoos.com checks permanent acceptance before admission, blocks ambiguous replay,
 * and waits twenty-four seconds after verified cleanup before another physical tab may arise.
 */
export class GlobalWebsiteTurnQueue {
	constructor(options = {}) {
		Object.assign(this, queueConfiguration(options));
		this.now = options.now || (() => Date.now());
		this.sleep = options.sleep || Support.delay;
		this.store = options.store || this.createStore(options);
		this.lastSnapshot = this.snapshot(Support.emptyQueueState());
	}

	createStore(options) {
		return new GlobalWebsiteQueueStore({
			rootPath: options.rootPath,
			now: this.now,
			sleep: this.sleep,
			pollMs: this.pollMs,
			leaseStaleMs: options.leaseStaleMs,
			acceptedReceiptTtlMs: this.acceptedReceiptTtlMs,
			maxAcceptedReceipts: this.maxAcceptedReceipts
		});
	}

	async acquire(metadata = {}, options = {}) {
		const ticket = createTicket(metadata, this.now());
		const durableAccepted = this.store.acceptedReceipt?.(ticket.id);
		if (durableAccepted) {
			throw acceptedTurnError(durableAccepted);
		}
		await this.store.mutate(state => admitTicket(state, ticket, this));
		const deadline = this.now() + Number(
			options.timeoutMs || this.acquisitionTimeoutMs
		);
		for (;;) {
			const waitingError = Support.waitingError(
				options,
				deadline,
				this.now,
				queueError
			);
			if (waitingError) {
				await Support.removeTicket(this.store, ticket);
				throw waitingError;
			}
			const decision = await this.store.mutate(
				state => this.decide(state, ticket)
			);
			this.lastSnapshot = decision.snapshot;
			if (decision.reconciliationRequired) throw reconciliationError();
			if (decision.accepted) throw acceptedTurnError(decision.accepted);
			if (decision.uncertain) throw uncertainTurnError(decision.uncertain);
			if (decision.lease) {
				return publicWebsiteLease(this, decision.lease, ticket.createdAt);
			}
			await this.sleep(Math.max(this.pollMs, decision.waitMs || 0));
		}
	}

	decide(state, ticket) {
		return {
			...decideTicket(state, ticket, this),
			snapshot: this.snapshot(state)
		};
	}

	async reconcile(options = {}) {
		return this.store.mutate(state => {
			const result = reconcileQueueState(state, options);
			this.lastSnapshot = this.snapshot(state);
			return { ...result, snapshot: this.lastSnapshot };
		});
	}

	snapshot(state) {
		return queueSnapshot(state, this, this.now());
	}

	status() {
		this.lastSnapshot = this.snapshot(this.store.clean(this.store.read()));
		return {
			...this.lastSnapshot,
			durableAcceptedReceipts: this.store.acceptedReceiptCount?.() || 0
		};
	}
}
