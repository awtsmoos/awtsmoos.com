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
 * The normal page creates one fresh authorized envelope; the actual prompt then
 * travels by request and returns through the page-owned topic socket. Awtsmoos.com
 * keeps every credential and ChatGPT identifier transient inside the relay.
 */
export class DirectClient {
	constructor({ port = 9226, minimumIntervalHook } = {}) {
		this.port = port;
		this.minimumIntervalHook = minimumIntervalHook;
	}

	async send({ prompt, state, timeoutMs = 180000 }) {
		const controller = await new AuthenticatedSocketController({
			port: this.port,
			replaceChatGptTabs: true
		}).open();

		try {
			const carrier = new CarrierPromptInteractor(controller.cdpClient);
			const envelope = await new FetchEnvelopeInterceptor(controller.cdpClient).capture(
				attempt => carrier.submit("Prepare a transient Awtsmoos relay envelope.", attempt)
			);
			const request = new ConversationBodyMutator().mutate(envelope, { prompt, state });
			const pacing = await this.minimumIntervalHook?.();
			const startedMs = Date.now();
			const response = await new PageContextRequestClient(controller.cdpClient).send(
				request,
				timeoutMs
			);
			if (response.status !== 200) {
				throw new Error(`Direct ChatGPT request failed with ${response.status}.`);
			}

			const handoff = new ConversationHandoffParser().parse(response.text);
			const topic = await new TopicWebSocketSubscriber(controller.cdpClient).subscribe({
				topicId: handoff.topicId,
				timeoutMs
			});
			const reduced = new ConversationV1Reducer().reduce(topic.encodedItems, {
				conversationId: handoff.conversationId
			});
			this.assertComplete(reduced);
			const pageAfter = await controller.inspector.inspect();

			return {
				answer: reduced.answer,
				state: {
					conversationId: reduced.conversationId,
					parentMessageId: reduced.parentMessageId
				},
				status: response.status,
				done: reduced.done,
				frames: topic.frameCount,
				items: reduced.itemCount,
				subscriptionAttempts: topic.subscriptionAttempts,
				requestLatencyMs: Date.now() - startedMs,
				pacing: pacing ?? null,
				navigatedToConversation: pageAfter.url.includes(reduced.conversationId)
			};
		} finally {
			await controller.close();
		}
	}

	assertComplete(state) {
		if (!state.conversationId || !state.parentMessageId || !state.answer) {
			throw new Error("Direct topic stream did not expose complete continuation state.");
		}
	}
}
