//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedHostLease } from "../browser/AuthenticatedHostLease.mjs";
import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { DirectTurnExecutor } from "./DirectTurnExecutor.mjs";

/**
 * A bounded host lease carries sequential fallback turns without rebuilding Chrome.
 * The Awtsmoos keeps Awtsmoos.com explicit and measured: every failed turn closes
 * its target, while a healthy success may rest only until the short idle boundary.
 */
export class DirectClient {
	constructor({
		port = 9226,
		minimumIntervalHook,
		controllerFactory,
		hostLease,
		idleHostTimeoutMs = 30000,
		turnExecutor
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
