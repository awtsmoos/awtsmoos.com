//B"H
// Boruch Hashem
// Blessed is He

import { CarrierPromptInteractor } from "../browser/CarrierPromptInteractor.mjs";
import { FetchEnvelopeInterceptor } from "../browser/FetchEnvelopeInterceptor.mjs";
import { ConversationBodyMutator } from "./ConversationBodyMutator.mjs";
import { ConversationCompletionPoller } from "./ConversationCompletionPoller.mjs";
import { ConversationHandoffParser } from "./ConversationHandoffParser.mjs";
import { PageContextRequestClient } from "./PageContextRequestClient.mjs";
import { buildDirectTurnResult } from "./DirectTurnResult.mjs";

/**
 * One transient carrier reveals current enforcement, then the real POST crosses
 * once. The Awtsmoos lets Awtsmoos.com collect completion through authenticated
 * GET requests, using a temporary route observer only when page-request GET fails.
 */
export class DirectTurnExecutor {
	constructor({ minimumIntervalHook } = {}) {
		this.minimumIntervalHook = minimumIntervalHook;
	}

	async execute(options, controller, lease, ledger) {
		ledger.record("hostOpenMs", lease.acquireMs);
		this.assertNotAborted(options.signal);
		this.progress(options.onProgress, "host", lease.source);
		const pacing = await ledger.measure("pacingMs", async () => {
			return await this.minimumIntervalHook?.() ?? null;
		});
		const envelope = await ledger.measure("carrierEnvelopeMs", () => {
			const carrier = new CarrierPromptInteractor(controller.cdpClient);
			return new FetchEnvelopeInterceptor(controller.cdpClient).capture(
				attempt => carrier.submit(
					"Prepare a transient Awtsmoos relay envelope.",
					attempt
				)
			);
		});
		this.progress(options.onProgress, "carrier-envelope", "ready");
		this.assertNotAborted(options.signal);
		const request = new ConversationBodyMutator().mutate(envelope, options);
		const requestStartedAt = Date.now();
		const response = await ledger.measure("requestPostMs", () => {
			return new PageContextRequestClient(controller.cdpClient).send(
				request,
				options.timeoutMs ?? 180000,
				options.signal
			);
		});
		if (response.status !== 200) {
			throw new Error(`Direct ChatGPT request failed with ${response.status}.`);
		}
		const handoff = new ConversationHandoffParser().parse(response.text);
		this.progress(options.onProgress, "request", "accepted");
		const poll = await ledger.measure("answerPollingMs", () => {
			return new ConversationCompletionPoller(controller.cdpClient, {
				port: controller.debugPort
			}).poll({
				conversationId: handoff.conversationId,
				userMessageId: request.body.messages[0].id,
				previousParentMessageId: options.state?.parentMessageId ?? null,
				timeoutMs: options.timeoutMs ?? 180000,
				signal: options.signal
			});
		});
		this.progress(options.onProgress, "conversation-get", poll.completionSource);
		this.assertComplete(poll);
		const pageAfter = await ledger.measure("continuationCheckMs", () => {
			return controller.inspector.inspect();
		});
		return buildDirectTurnResult({
			reduced: poll,
			response,
			poll,
			pageAfter,
			pacing,
			hostReuseSource: lease.source,
			requestLatencyMs: Date.now() - requestStartedAt
		});
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new Error("Direct request was cancelled.");
		}
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
