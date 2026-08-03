// B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedHostLease } from "../browser/AuthenticatedHostLease.mjs";
import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { DetachedConversationPoller } from "./DetachedConversationPoller.mjs";
import { DetachedSessionVault } from "./DetachedSessionVault.mjs";
import { DirectClientResultPresenter } from "./DirectClientResultPresenter.mjs";
import { DirectTurnExecutor } from "./DirectTurnExecutor.mjs";

/**
 * @file Closes the prompt tab before detached, credential-safe answer polling.
 * @description
 * The Awtsmoos lets the visible vessel live only through accepted Send and route
 * capture. Authentication remains memory-only, the verified close starts cooldown,
 * and the already accepted answer is read without opening another browser target.
 */
export class DirectClient {
	constructor(options = {}) {
		this.port = options.port || 9226;
		this.forceNewTarget = options.forceNewTarget !== false;
		const openHost = options.controllerFactory || (() =>
			new AuthenticatedSocketController({
				port: this.port,
				replaceChatGptTabs: false,
				forceNewTarget: this.forceNewTarget
			}).open());
		this.hostLease = options.hostLease || new AuthenticatedHostLease({ openHost });
		this.turnExecutor = options.turnExecutor || new DirectTurnExecutor();
		this.detachedPoller = options.detachedPoller || new DetachedConversationPoller();
		this.sessionVault = options.sessionVault || new DetachedSessionVault();
		this.presenter = options.presenter || new DirectClientResultPresenter();
	}

	async send(options = {}) {
		this.assertNotAborted(options.signal);
		const ledger = new StageTimingLedger();
		let submitted = null;
		try {
			submitted = await this.hostLease.run(
				(controller, lease) => this.turnExecutor.execute(options, controller, lease, ledger),
				{ closeAfterTask: true }
			);
		} catch (error) {
			if (error.submissionAccepted && error.tabClose?.verified) {
				await this.notifyClosed(options, error.tabClose, Date.now());
			}
			throw error;
		}
		if (!submitted.tabClose?.verified) throw closeError(submitted.tabClose);
		const closedAt = Date.now();
		this.sessionVault.set(submitted.submission.conversationId, submitted.submission.session);
		await this.notifyClosed(options, submitted.tabClose, closedAt);
		const poll = await ledger.measure("detachedAnswerPollingMs", () =>
			this.detachedPoller.poll({
				...submitted.submission,
				timeoutMs: options.timeoutMs ?? 180000,
				signal: options.signal
			}));
		this.sessionVault.delete(submitted.submission.conversationId);
		return this.presenter.send(submitted, poll, ledger, closedAt);
	}

	async recover(options = {}) {
		const state = options.state;
		const session = this.sessionVault.get(state?.conversationId);
		if (!state?.conversationId || !state?.parentMessageId || !session) {
			throw codedError("detached_recovery_session_missing");
		}
		const poll = await this.detachedPoller.poll({
			conversationId: state.conversationId,
			userMessageId: null,
			previousParentMessageId: state.parentMessageId,
			session,
			timeoutMs: options.timeoutMs ?? 180000,
			signal: options.signal
		});
		this.sessionVault.delete(state.conversationId);
		return this.presenter.recovery(state, poll);
	}

	async notifyClosed(options, tabClose, closedAt) {
		await options.onTabClosed?.({ tabClose, closedAt, verified: true });
	}

	close() { return this.hostLease.close(); }

	status() {
		return { port: this.port, forceNewTarget: this.forceNewTarget,
			detachedPolling: true, detachedSessions: this.sessionVault.status(),
			hostLease: this.hostLease.status() };
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
