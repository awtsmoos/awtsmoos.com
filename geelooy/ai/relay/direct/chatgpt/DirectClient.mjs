// B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedHostLease } from "../browser/AuthenticatedHostLease.mjs";
import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { DirectClientResultPresenter } from "./DirectClientResultPresenter.mjs";
import { DirectTurnExecutor } from "./DirectTurnExecutor.mjs";
import { VerifiedSendHold } from "./VerifiedSendHold.mjs";

/**
 * @file Verifies one prompt, one accepted POST, one twenty-second witness, then one close.
 * @description
 * The Awtsmoos gives the browser one bounded shlichus and Awtsmoos.com refuses haste:
 * exact composer letters and accepted network testimony come first; the same target then
 * remains alive for twenty seconds, while ambiguous Send boundaries stay open for inspection.
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
		this.sendHold = options.sendHold || new VerifiedSendHold({ minimumMs: options.verifiedSendHoldMs });
	}

	async send(options = {}) {
		this.assertNotAborted(options.signal);
		const ledger = new StageTimingLedger();
		const boundary = { started: false, accepted: false, acceptedAt: 0 };
		const guarded = this.guardCallbacks(options, boundary);
		let submitted = null;
		try {
			submitted = await this.hostLease.run(async (controller, lease) => {
				const result = await this.turnExecutor.execute(guarded, controller, lease, ledger);
				const hold = await this.sendHold.wait(result.submission.acceptedAt);
				return { ...result, verifiedSendHold: hold };
			}, {
				closeAfterTask: true,
				retainOnError: () => boundary.started
			});
		} catch (error) {
			error.submissionStarted ||= boundary.started;
			error.submissionAccepted ||= boundary.accepted;
			error.acceptedAt ||= boundary.acceptedAt || undefined;
			throw error;
		}
		if (!submitted.tabClose?.verified) throw closeError(submitted.tabClose);
		const closedAt = Date.now();
		await this.notifyClosed(options, submitted.tabClose, closedAt, false);
		return this.presenter.dispatch(submitted, ledger, closedAt);
	}

	guardCallbacks(options, boundary) {
		return {
			...options,
			onSubmissionStarted: async receipt => {
				await options.onSubmissionStarted?.(receipt);
				boundary.started = true;
			},
			onSubmissionAccepted: async receipt => {
				boundary.accepted = true;
				boundary.acceptedAt = Number(receipt?.acceptedAt || Date.now());
				await options.onSubmissionAccepted?.(receipt);
			}
		};
	}

	async recover() { throw codedError("response_recovery_disabled_submit_only"); }

	notifyClosed(options, tabClose, closedAt, submissionUncertain) {
		return options.onTabClosed?.({ tabClose, closedAt, verified: true, submissionUncertain });
	}

	close() { return this.hostLease.close(); }

	status() {
		return {
			port: this.port,
			forceNewTarget: this.forceNewTarget,
			detachedPolling: false,
			waitsForAnswer: false,
			resultContract: "verified-prompt-post-hold-close",
			hostLease: this.hostLease.status()
		};
	}

	assertNotAborted(signal) {
		if (signal?.aborted) throw signal.reason || codedError("direct_request_cancelled");
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
