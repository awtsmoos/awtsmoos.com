// B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedHostLease } from "../browser/AuthenticatedHostLease.mjs";
import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { DirectClientResultPresenter } from "./DirectClientResultPresenter.mjs";
import { DirectTurnExecutor } from "./DirectTurnExecutor.mjs";

/**
 * @file Sends once, verifies acceptance, closes once, and returns without an answer.
 * @description
 * The Awtsmoos gives the browser one bounded shlichus: deliver the prompt. After the
 * website accepts it, Awtsmoos.com closes and verifies the target, starts cooldown,
 * and releases the caller while the custom GPT continues through durable tools.
 */
export class DirectClient {
	constructor(options = {}) {
		this.port = options.port || 9224;
		this.forceNewTarget = options.forceNewTarget !== false;
		const openHost = options.controllerFactory || (() =>
			new AuthenticatedSocketController({
				port: this.port,
				replaceChatGptTabs: false,
				forceNewTarget: this.forceNewTarget
			}).open());
		this.hostLease = options.hostLease || new AuthenticatedHostLease({ openHost });
		this.turnExecutor = options.turnExecutor || new DirectTurnExecutor();
		this.presenter = options.presenter || new DirectClientResultPresenter();
	}

	async send(options = {}) {
		this.assertNotAborted(options.signal);
		const ledger = new StageTimingLedger();
		const submitted = await this.hostLease.run(
			(controller, lease) => this.turnExecutor.execute(options, controller, lease, ledger),
			{ closeAfterTask: true }
		);
		if (!submitted.tabClose?.verified) throw closeError(submitted.tabClose);
		const closedAt = Date.now();
		await options.onTabClosed?.({
			tabClose: submitted.tabClose,
			closedAt,
			verified: true
		});
		return this.presenter.dispatch(submitted, ledger, closedAt);
	}

	async recover() {
		throw codedError("response_recovery_disabled_submit_only");
	}

	close() {
		return this.hostLease.close();
	}

	status() {
		return {
			port: this.port,
			forceNewTarget: this.forceNewTarget,
			detachedPolling: false,
			waitsForAnswer: false,
			resultContract: "prompt-dispatch-receipt",
			hostLease: this.hostLease.status()
		};
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || codedError("direct_request_cancelled");
		}
	}
}

function closeError(tabClose) {
	const error = codedError("owned_target_close_unverified");
	error.tabClose = tabClose;
	return error;
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
