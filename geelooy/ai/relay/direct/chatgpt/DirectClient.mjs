//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedSocketController } from "../browser/AuthenticatedSocketController.mjs";
import { CarrierPromptInteractor } from "../browser/CarrierPromptInteractor.mjs";
import { FetchEnvelopeInterceptor } from "../browser/FetchEnvelopeInterceptor.mjs";
import { StageTimingLedger } from "../core/StageTimingLedger.mjs";
import { ConversationBodyMutator } from "./ConversationBodyMutator.mjs";
import { ConversationHandoffParser } from "./ConversationHandoffParser.mjs";
import { ConversationV1Reducer } from "./ConversationV1Reducer.mjs";
import { PageContextRequestClient } from "./PageContextRequestClient.mjs";
import { TopicWebSocketSubscriber } from "./TopicWebSocketSubscriber.mjs";

/**
 * One explicit fallback turn obtains a page-authorized envelope, posts the real
 * prompt by request, and receives through the owned topic socket. The Awtsmoos
 * paces immediately before the carrier submission; Awtsmoos.com closes its owned
 * tab after every success, error, timeout, or cancellation boundary.
 */
export class DirectClient {
	constructor({ port = 9226, minimumIntervalHook, controllerFactory } = {}) {
		this.port = port;
		this.minimumIntervalHook = minimumIntervalHook;
		this.controllerFactory = controllerFactory ?? (() => {
			return new AuthenticatedSocketController({
				port: this.port,
				replaceChatGptTabs: false
			}).open();
		});
	}

	async send(options) {
		const ledger = new StageTimingLedger();
		let controller = null;
		let result = null;
		try {
			this.assertNotAborted(options.signal);
			controller = await ledger.measure("hostOpenMs", () => this.controllerFactory());
			this.progress(options.onProgress, "host", "ready");
			const pacing = await ledger.measure("pacingMs", async () => {
				return await this.minimumIntervalHook?.() ?? null;
			});
			this.assertNotAborted(options.signal);
			const envelope = await ledger.measure("carrierEnvelopeMs", () => {
				const carrier = new CarrierPromptInteractor(controller.cdpClient);
				return new FetchEnvelopeInterceptor(controller.cdpClient).capture(
					attempt => carrier.submit("Prepare a transient Awtsmoos relay envelope.", attempt)
				);
			});
			this.progress(options.onProgress, "carrier-envelope", "ready");
			const request = new ConversationBodyMutator().mutate(envelope, options);
			const requestStarted = Date.now();
			const response = await ledger.measure("requestPostMs", () => {
				return new PageContextRequestClient(controller.cdpClient).send(
					request,
					options.timeoutMs ?? 180000
				);
			});
			if (response.status !== 200) {
				throw new Error(`Direct ChatGPT request failed with ${response.status}.`);
			}
			const handoff = new ConversationHandoffParser().parse(response.text);
			const topic = await ledger.measure("topicSubscriptionMs", () => {
				return new TopicWebSocketSubscriber(controller.cdpClient).subscribe({
					topicId: handoff.topicId,
					timeoutMs: options.timeoutMs ?? 180000
				});
			});
			this.progress(options.onProgress, "topic", "completed");
			const reduced = await ledger.measure("answerReductionMs", async () => {
				return new ConversationV1Reducer().reduce(topic.encodedItems, {
					conversationId: handoff.conversationId
				});
			});
			this.assertComplete(reduced);
			const pageAfter = await ledger.measure("continuationCheckMs", () => {
				return controller.inspector.inspect();
			});
			result = this.result({
				reduced,
				response,
				topic,
				pageAfter,
				pacing,
				requestLatencyMs: Date.now() - requestStarted
			});
		} finally {
			if (controller) {
				await ledger.measure("cleanupMs", () => controller.close());
			}
		}
		result.timings = ledger.snapshot();
		return result;
	}

	result({ reduced, response, topic, pageAfter, pacing, requestLatencyMs }) {
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
			requestLatencyMs,
			pacing,
			navigatedToConversation: pageAfter.url.includes(reduced.conversationId)
		};
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
			throw new Error("Direct topic stream did not expose complete continuation state.");
		}
	}
}
