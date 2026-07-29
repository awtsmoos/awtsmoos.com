//B"H
// Boruch Hashem
// Blessed is He

import {
	buildOfficialApiStressReport,
	validateOfficialApiStressReport
} from "./OfficialApiStressReport.mjs";

/**
 * Four official API chains advance sequentially across one global pacing clock.
 * The Awtsmoos lets Awtsmoos.com keep opaque keys only in memory while exact
 * request-only replies prove continuity without Chrome, DOM, or browser fallback.
 */
export class OfficialApiStressRunner {
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
		if (!this.service?.send) {
			throw new TypeError("Official API stress requires a direct service.");
		}
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
		const report = buildOfficialApiStressReport({
			records,
			conversations: this.conversations,
			messages: this.messages,
			minimumIntervalMs: this.minimumIntervalMs
		});
		validateOfficialApiStressReport(report);
		return report;
	}

	async executeTurn({ conversation, message, conversationKey }) {
		const expected = `BH API REQUEST STRESS C${conversation} M${message}.`;
		const result = await this.service.send({
			prompt: `Reply with exactly: ${expected}`,
			conversationKey,
			mode: "official-api-request-only",
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
			&& result.completionSource === "official-responses-api"
			&& exactAnswer;
		if (!success) {
			throw new Error("Official API stress turn failed its transport contract.");
		}
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
