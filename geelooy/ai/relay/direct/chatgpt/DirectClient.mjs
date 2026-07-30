//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedHostLease } from "../browser/AuthenticatedHostLease.mjs";
import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { ConversationRecoveryExecutor } from "./ConversationRecoveryExecutor.mjs";
import { DirectTurnExecutor } from "./DirectTurnExecutor.mjs";

/**
 * A bounded host lease carries sequential website turns and GET-only recovery.
 * A failed lease is forgotten; a reused target is detached rather than closed.
 */
export class DirectClient {
	constructor({
		port = 9226,
		minimumIntervalHook,
		controllerFactory,
		hostLease,
		idleHostTimeoutMs = 30000,
		turnExecutor,
		recoveryExecutor = new ConversationRecoveryExecutor()
	} = {}) {
		this.port = port;
		const openHost = controllerFactory ?? (() => {
			return new AuthenticatedSocketController({
				port: this.port,
				replaceChatGptTabs: false
			}).open();
		});
		this.hostLease = hostLease ?? new AuthenticatedHostLease({
			openHost,
			idleTimeoutMs: idleHostTimeoutMs
		});
		this.turnExecutor = turnExecutor ?? new DirectTurnExecutor({
			minimumIntervalHook
		});
		this.recoveryExecutor = recoveryExecutor;
	}

	async send(options = {}) {
		this.assertNotAborted(options.signal);
		const ledger = new StageTimingLedger();
		const result = await this.hostLease.run((controller, lease) => {
			return this.turnExecutor.execute(options, controller, lease, ledger);
		});
		result.timings = ledger.snapshot();
		return result;
	}

	async recover(options = {}) {
		this.assertNotAborted(options.signal);
		return this.hostLease.run(controller =>
			this.recoveryExecutor.execute(options, controller)
		);
	}

	close() {
		return this.hostLease.close();
	}

	status() {
		return {
			port: this.port,
			hostLease: this.hostLease.status()
		};
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new Error("Direct request was cancelled.");
		}
	}
}
