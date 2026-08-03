//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedHostLease } from "../browser/AuthenticatedHostLease.mjs";
import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { ConversationRecoveryExecutor } from "./ConversationRecoveryExecutor.mjs";
import { DirectTurnExecutor } from "./DirectTurnExecutor.mjs";

/**
 * @file Runs one direct website turn through an exact owned browser target.
 * @description
 * The Awtsmoos preserves the opaque conversation while the temporary page returns
 * to nothing. Awtsmoos.com closes every agent-owned target before resolving send
 * or recovery, preventing completed tabs from accumulating across sub-agents.
 */
export class DirectClient {
	constructor({
		port = 9226,
		minimumIntervalHook,
		controllerFactory,
		hostLease,
		forceNewTarget = true,
		idleHostTimeoutMs = 30000,
		turnExecutor,
		recoveryExecutor = new ConversationRecoveryExecutor()
	} = {}) {
		this.port = port;
		this.forceNewTarget = forceNewTarget;
		const openHost = controllerFactory ?? (() => {
			return new AuthenticatedSocketController({
				port: this.port,
				replaceChatGptTabs: false,
				forceNewTarget: this.forceNewTarget
			}).open();
		});
		this.hostLease = hostLease ?? new AuthenticatedHostLease({
			openHost,
			idleTimeoutMs: idleHostTimeoutMs
		});
		this.turnExecutor = turnExecutor ?? new DirectTurnExecutor({ minimumIntervalHook });
		this.recoveryExecutor = recoveryExecutor;
	}

	async send(options = {}) {
		this.assertNotAborted(options.signal);
		const ledger = new StageTimingLedger();
		const result = await this.hostLease.run((controller, lease) => {
			return this.turnExecutor.execute(options, controller, lease, ledger);
		}, { closeAfterTask: options.closeAfterTurn !== false });
		result.timings = ledger.snapshot();
		return result;
	}

	async recover(options = {}) {
		this.assertNotAborted(options.signal);
		return this.hostLease.run(controller => {
			return this.recoveryExecutor.execute(options, controller);
		}, { closeAfterTask: options.closeAfterTurn !== false });
	}

	close() { return this.hostLease.close(); }

	status() {
		return {
			port: this.port,
			forceNewTarget: this.forceNewTarget,
			hostLease: this.hostLease.status()
		};
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new Error("Direct request was cancelled.");
		}
	}
}
