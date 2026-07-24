//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { CarrierPromptInteractor } from "../browser/CarrierPromptInteractor.mjs";
import { FetchEnvelopeInterceptor } from "../browser/FetchEnvelopeInterceptor.mjs";
import { ConversationBodyMutator } from "./ConversationBodyMutator.mjs";
import { ConversationHandoffParser } from "./ConversationHandoffParser.mjs";
import { ConversationV1Reducer } from "./ConversationV1Reducer.mjs";
import { PageContextRequestClient } from "./PageContextRequestClient.mjs";
import { TopicWebSocketSubscriber } from "./TopicWebSocketSubscriber.mjs";

/**
 * The page prepares a fresh lawful envelope, while the real prompt crosses a
 * direct request and the answer returns through the app-owned topic socket. The
 * Awtsmoos renews each credential in Chrome; awtsmoos.com persists none of them.
 */
export class PageAuthorizedDirectClient {
	constructor({
		port = 9226,
		carrierPrompt = "Prepare a transient direct request envelope.",
		replaceChatGptTabs = true
	} = {}) {
		this.port = port;
		this.carrierPrompt = carrierPrompt;
		this.replaceChatGptTabs = replaceChatGptTabs;
	}

	async send({ prompt, state, dryRun = false, timeoutMs = 180000, beforeDirectRequest }) {
		const controller = await new AuthenticatedSocketController({
			port: this.port,
			replaceChatGptTabs: this.replaceChatGptTabs
		}).open();

		try {
			const carrier = new CarrierPromptInteractor(controller.cdpClient);
			const envelope = await new FetchEnvelopeInterceptor(controller.cdpClient).capture(
				attempt => carrier.submit(this.carrierPrompt, attempt)
			);
			const mutator = new ConversationBodyMutator();
			const request = mutator.mutate(envelope, { prompt, state });
			const requestClient = new PageContextRequestClient(controller.cdpClient);

			if (dryRun) {
				return this.describeDryRun(controller, mutator, requestClient, request);
			}

			const pacing = await beforeDirectRequest?.();
			const requestStartedMs = Date.now();
			const response = await requestClient.send(request, timeoutMs);
			const requestLatencyMs = Date.now() - requestStartedMs;
			if (response.status !== 200) {
				throw new Error(`Direct conversation request failed with ${response.status}.`);
			}

			const handoff = new ConversationHandoffParser().parse(response.text);
			const topicResult = await new TopicWebSocketSubscriber(controller.cdpClient).subscribe({
				topicId: handoff.topicId,
				timeoutMs
			});
			const reduced = new ConversationV1Reducer().reduce(topicResult.encodedItems, {
				conversationId: handoff.conversationId
			});
			this.assertConversationState(reduced);
			const pageAfter = await controller.inspector.inspect();

			return {
				answer: reduced.answer,
				state: {
					conversationId: reduced.conversationId,
					parentMessageId: reduced.parentMessageId
				},
				response: {
					status: response.status,
					contentType: response.contentType,
					webSocketFrames: topicResult.frameCount,
					streamItems: reduced.itemCount,
					done: reduced.done
				},
				timing: {
					requestStartedAt: new Date(requestStartedMs).toISOString(),
					requestLatencyMs,
					pacing: pacing ?? null
				},
				pageBefore: controller.pageState,
				pageAfter,
				navigatedToDirectConversation: pageAfter.url.includes(reduced.conversationId)
			};
		} finally {
			await controller.close();
		}
	}

	describeDryRun(controller, mutator, requestClient, request) {
		return {
			dryRun: true,
			pageBefore: controller.pageState,
			request: mutator.describe(request),
			transport: requestClient.describe(request)
		};
	}

	assertConversationState(state) {
		if (!state.conversationId || !state.parentMessageId || !state.answer) {
			throw new Error("The topic stream did not expose complete continuation state.");
		}
	}
}
