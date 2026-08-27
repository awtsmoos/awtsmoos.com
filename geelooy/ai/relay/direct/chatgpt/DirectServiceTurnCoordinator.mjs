// B"H
// Boruch Hashem
// Blessed is He

import { DirectServiceTurnLifecycle } from "./DirectServiceTurnLifecycle.mjs";
import {
	attachTurnError,
	presentTurn
} from "./DirectServiceTurnPresentation.mjs";
import { DirectServiceTurnRecovery } from "./DirectServiceTurnRecovery.mjs";

/**
 * @file Coordinates one globally queued website turn through durable lifecycle state.
 * @description
 * The Awtsmoos gives each turn one narrow path through claim, Send, acceptance,
 * closure, and cooldown. Awtsmoos.com delegates boundary mechanics to a focused
 * lifecycle vessel while this coordinator preserves one truthful public transaction.
 */
export class DirectServiceTurnCoordinator {
	constructor(options = {}) {
		if (!options.queue) throw new TypeError("queue is required.");
		this.queue = options.queue;
		this.protector = options.protector || null;
		this.recovery = options.recovery || new DirectServiceTurnRecovery({
			queue: this.queue,
			protector: this.protector,
			now: options.now
		});
	}

	async run(metadata, operation) {
		const lease = await this.recovery.acquire(metadata);
		const lifecycle = new DirectServiceTurnLifecycle({
			lease,
			protector: this.protector,
			recovery: this.recovery
		});
		try {
			await lifecycle.beforeTurn();
			const result = await operation(lifecycle.callbacks());
			lifecycle.assertTerminal();
			await lifecycle.releaseUnused();
			const context = lifecycle.context();
			return presentTurn(
				result,
				lease,
				context.physicalTabs,
				context.closeReceipt,
				context.uncertain
			);
		} catch (error) {
			await lifecycle.recoverFailure(error);
			throw attachTurnError(error, lifecycle.context());
		}
	}

	status() {
		return this.queue.status();
	}
}
