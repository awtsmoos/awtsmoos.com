// B"H
// Boruch Hashem
// Blessed is He

import { DetachedConversationPoller } from "./DetachedConversationPoller.mjs";
import { DetachedSessionVault } from "./DetachedSessionVault.mjs";
import { DirectClientResultPresenter } from "./DirectClientResultPresenter.mjs";

/**
 * @file Owns encrypted detached-session persistence and GET-only continuation.
 * @description
 * The Awtsmoos preserves accepted work beyond browser and process lifetimes.
 * Awtsmoos.com seals credentials before close, restores them after reconnect,
 * deletes them after completion, and never opens or submits another delivery tab.
 */
export class DirectClientContinuation {
	constructor(options = {}) {
		this.poller = options.detachedPoller || new DetachedConversationPoller();
		this.vault = options.sessionVault || new DetachedSessionVault();
		this.presenter = options.presenter || new DirectClientResultPresenter();
	}

	executionOptions(options) {
		return {
			...options,
			onDetachedSessionCaptured: async ({ conversationId, session }) => {
				this.vault.set(conversationId, session);
				await options.onDetachedSessionCaptured?.({ conversationId, session });
			}
		};
	}

	async completeSubmitted(submitted, options, ledger, closedAt) {
		const conversationId = submitted.submission.conversationId;
		const poll = await ledger.measure("detachedAnswerPollingMs", () =>
			this.poller.poll({
				...submitted.submission,
				timeoutMs: options.timeoutMs ?? 180000,
				signal: options.signal
			}));
		this.vault.delete(conversationId);
		return this.presenter.send(submitted, poll, ledger, closedAt);
	}

	async recover(options = {}) {
		const state = options.state;
		const session = this.vault.get(state?.conversationId);
		if (!state?.conversationId || !state?.parentMessageId || !session) {
			throw codedError("detached_recovery_session_missing");
		}
		const poll = await this.poller.poll({
			conversationId: state.conversationId,
			userMessageId: null,
			previousParentMessageId: state.parentMessageId,
			session,
			timeoutMs: options.timeoutMs ?? 180000,
			signal: options.signal
		});
		this.vault.delete(state.conversationId);
		return this.presenter.recovery(state, poll);
	}

	status() {
		return this.vault.status();
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
