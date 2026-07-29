//B"H
// Boruch Hashem
// Blessed is He

import {
	buildFallbackStressReport,
	validateFallbackStressReport
} from "./FallbackStressReport.mjs";

/**
 * ChatGPT website conversations advance across one sequential paced timeline. The
 * Awtsmoos keeps continuation keys only in memory while every prompt uses the
 * ordinary website composer and every completion returns through authenticated GET.
 */
export class FallbackStressRunner {
	constructor({
		service,
		counter,
		conversations = 4,
		messages = 5,
		minimumIntervalMs = 10000,
		timeoutMs = 240000,
		onEvent = () => undefined
	} = {}) {
		this.service = service;
		this.counter = counter;
		this.conversations = conversations;
		this.messages = messages;
		this.minimumIntervalMs = Math.max(10000, minimumIntervalMs);
		this.timeoutMs = timeoutMs;
		this.onEvent = onEvent;
	}

	async run() {
		this.validateDependencies();
		const before = await this.counter.read();
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
		const after = await this.counter.read();
		const report = buildFallbackStressReport({
			records,
			conversations: this.conversations,
			messages: this.messages,
			minimumIntervalMs: this.minimumIntervalMs,
			before,
			after
		});
		validateFallbackStressReport(report);
		return report;
	}

	async executeTurn({ conversation, message, conversationKey }) {
		const expected = `BH WEBSITE STRESS C${conversation} M${message}.`;
		let accepted = false;
		const result = await this.service.send({
			prompt: `Reply with exactly: ${expected}`,
			conversationKey,
			mode: "chatgpt-website",
			timeoutMs: this.timeoutMs,
			onProgress: event => {
				if (event.stage === "website-submit" && event.status === "accepted") {
					accepted = true;
				}
				this.onEvent({ type: "progress", conversation, message, ...event });
			}
		});
		const exactAnswer = result.answer === expected;
		const success = result.ok
			&& result.status === 200
			&& result.done === true
			&& result.sameConversation === true
			&& result.navigatedToConversation === true
			&& result.composerTouched === true
			&& result.submissionTransport === "chatgpt-website-composer"
			&& exactAnswer;
		if (!success) {
			const error = new Error("ChatGPT website stress turn failed its contract.");
			error.accepted = accepted;
			throw error;
		}
		return {
			conversation,
			message,
			conversationKey: result.conversationKey,
			success,
			exactAnswer,
			created: result.created,
			sameConversation: result.sameConversation,
			navigatedToConversation: result.navigatedToConversation,
			composerTouched: result.composerTouched,
			submissionTransport: result.submissionTransport,
			completionSource: result.completionSource,
			hostReuseSource: result.hostReuseSource,
			intervalMs: result.pacing?.intervalMs ?? null,
			waitMs: result.pacing?.waitMs ?? null,
			requestLatencyMs: result.requestLatencyMs,
			pollCount: result.subscriptionAttempts
		};
	}

	validateDependencies() {
		if (!this.service?.send || !this.counter?.read) {
			throw new TypeError("Website stress requires a direct service and counter.");
		}
	}
}
