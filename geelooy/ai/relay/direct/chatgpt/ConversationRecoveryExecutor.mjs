//B"H

import { ConversationCompletionPoller } from "./ConversationCompletionPoller.mjs";
import { WebsiteConversationNavigator } from "./WebsiteConversationNavigator.mjs";

/**
 * Recovers an accepted continuation exclusively through authenticated GETs.
 * It never touches the composer and can only operate from an established private
 * conversation state whose previous assistant node is known.
 */
export class ConversationRecoveryExecutor {
	constructor({
		navigator = new WebsiteConversationNavigator()
	} = {}) {
		this.navigator = navigator;
	}

	async execute(options, controller) {
		const state = options.state;
		if (!state?.conversationId || !state?.parentMessageId) {
			throw codedError("conversation_recovery_state_missing");
		}
		await this.navigator.prepare(controller, state);
		const poll = await new ConversationCompletionPoller(controller.cdpClient, {
			port: controller.debugPort
		}).poll({
			conversationId: state.conversationId,
			userMessageId: null,
			previousParentMessageId: state.parentMessageId,
			timeoutMs: options.timeoutMs ?? 180000,
			signal: options.signal
		});
		if (!poll.done || !poll.parentMessageId || !poll.answer) {
			throw codedError("conversation_recovery_incomplete");
		}
		return {
			answer: poll.answer,
			state: {
				conversationId: state.conversationId,
				parentMessageId: poll.parentMessageId
			},
			status: 200,
			done: true,
			frames: 0,
			items: poll.itemCount,
			subscriptionAttempts: poll.pollCount,
			completionSource: `${poll.completionSource}-recovery`,
			requestLatencyMs: 0,
			pacing: null,
			hostReuseSource: "recovery",
			navigatedToConversation: true,
			composerTouched: false,
			submissionTransport: "none-get-recovery"
		};
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
