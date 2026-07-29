//B"H
// Boruch Hashem
// Blessed is He

import {
	buildRequestOnlyStressReport,
	validateRequestOnlyStressReport
} from "./RequestOnlyStressReport.mjs";

/**
 * Four strict request-only chains advance across one global pacing clock. The
 * Awtsmoos keeps opaque keys only in memory while exact replies prove continuity
 * through official or localhost HTTP, never Chrome or DOM.
 */
export class RequestOnlyStressRunner {
	constructor({
		service,
		conversations = 4,
		messages = 5,
		minimumIntervalMs = 10000,
		timeoutMs = 240000,
		onEvent = () => undefined
	} = {}) {
		this.service = service;
		this.conversations = conversations;
		this.messages = messages;
		this.minimumIntervalMs = Math.max(10000, minimumIntervalMs);
		this.timeoutMs = timeoutMs;
		this.onEvent = onEvent;
	}

	async run() {
		if (!this.service?.send) throw new TypeError("Request-only stress requires a service.");
		const keys = Array.from({ length: this.conversations }, () => null);
		const records = [];
		for (let message = 1; message <= this.messages; message += 1) {
			for (let index = 0; index < this.conversations; index += 1) {
				const record = await this.executeTurn({
					conversation: index + 1,
					message,
					conversationKey: keys[index]
				});
				keys[index] = record.conversationKey;
				delete record.conversationKey;
				records.push(record);
				this.onEvent({ type: "turn-complete", completed: records.length, ...record });
			}
		}
		const report = buildRequestOnlyStressReport({
			records,
			conversations: this.conversations,
			messages: this.messages,
			minimumIntervalMs: this.minimumIntervalMs
		});
		validateRequestOnlyStressReport(report);
		return report;
	}

	async executeTurn({ conversation, message, conversationKey }) {
		const expected = `BH REQUEST STRESS C${conversation} M${message}.`;
		const result = await this.service.send({
			prompt: `Reply with exactly: ${expected}`,
			conversationKey,
			mode: "strict-request-only",
			timeoutMs: this.timeoutMs,
			onProgress: event => this.onEvent({
				type: "progress",
				conversation,
				message,
				stage: event.stage,
				status: event.status,
				at: event.at
			})
		});
		const exactAnswer = result.answer === expected;
		const success = result.ok
			&& result.status === 200
			&& result.done === true
			&& result.sameConversation === true
			&& result.navigatedToConversation === false
			&& exactAnswer;
		if (!success) throw new Error("Request-only stress turn failed its transport contract.");
		return {
			conversation,
			message,
			conversationKey: result.conversationKey,
			success,
			exactAnswer,
			created: result.created,
			completionSource: result.completionSource,
			intervalMs: result.pacing?.intervalMs ?? null,
			waitMs: result.pacing?.waitMs ?? null,
			requestLatencyMs: result.requestLatencyMs,
			model: result.model ?? null,
			usage: result.usage ?? null
		};
	}
}
