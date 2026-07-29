//B"H
// Boruch Hashem
// Blessed is He

import { WebsitePromptInteractor } from "../browser/WebsitePromptInteractor.mjs";
import { ConversationCompletionPoller } from "./ConversationCompletionPoller.mjs";
import { ConversationRequestObserver } from "./ConversationRequestObserver.mjs";
import { ConversationRouteWaiter } from "./ConversationRouteWaiter.mjs";
import { WebsiteConversationNavigator } from "./WebsiteConversationNavigator.mjs";

/**
 * One normal ChatGPT website turn types the actual prompt, clicks the ordinary send
 * control, and then reads completion through authenticated conversation GETs. No
 * request is replaced, replayed, suppressed, fabricated, or sent outside ChatGPT.
 */
export class DirectTurnExecutor {
	constructor({
		minimumIntervalHook,
		navigator = new WebsiteConversationNavigator(),
		routeWaiter = new ConversationRouteWaiter()
	} = {}) {
		this.minimumIntervalHook = minimumIntervalHook;
		this.navigator = navigator;
		this.routeWaiter = routeWaiter;
	}

	async execute(options, controller, lease, ledger) {
		ledger.record("hostOpenMs", lease.acquireMs);
		this.assertNotAborted(options.signal);
		this.progress(options.onProgress, "host", lease.source);
		const pacing = await ledger.measure("pacingMs", async () => {
			return await this.minimumIntervalHook?.() ?? null;
		});
		await ledger.measure("conversationNavigationMs", () => {
			return this.navigator.prepare(controller, options.state);
		});
		const startedAt = Date.now();
		const request = await ledger.measure("websiteSubmissionMs", () => {
			const observer = new ConversationRequestObserver(controller.cdpClient);
			const interactor = new WebsitePromptInteractor(controller.cdpClient);
			return observer.observe(() => interactor.submit(options.prompt));
		});
		this.progress(options.onProgress, "website-submit", "accepted");
		const conversationId = await ledger.measure("conversationRouteMs", () => {
			return this.routeWaiter.wait(controller, {
				expectedId: request.conversationId || options.state?.conversationId || null,
				timeoutMs: options.timeoutMs ?? 30000
			});
		});
		const poll = await ledger.measure("answerPollingMs", () => {
			return new ConversationCompletionPoller(controller.cdpClient, {
				port: controller.debugPort
			}).poll({
				conversationId,
				userMessageId: request.userMessageId,
				previousParentMessageId: options.state?.parentMessageId ?? null,
				timeoutMs: options.timeoutMs ?? 180000,
				signal: options.signal
			});
		});
		this.assertComplete(poll);
		return {
			answer: poll.answer,
			state: { conversationId, parentMessageId: poll.parentMessageId },
			status: 200,
			done: poll.done,
			frames: 0,
			items: poll.itemCount,
			subscriptionAttempts: poll.pollCount,
			completionSource: poll.completionSource,
			requestLatencyMs: Date.now() - startedAt,
			pacing,
			hostReuseSource: lease.source,
			navigatedToConversation: true,
			composerTouched: true,
			submissionTransport: "chatgpt-website-composer"
		};
	}

	assertNotAborted(signal) {
		if (signal?.aborted) throw signal.reason || new Error("Direct request was cancelled.");
	}

	progress(callback, stage, status) {
		try {
			callback?.({ stage, status, at: Date.now() });
		} catch {}
	}

	assertComplete(state) {
		if (!state.conversationId || !state.parentMessageId || !state.answer) {
			throw new Error("Conversation GET did not expose complete continuation state.");
		}
	}
}
