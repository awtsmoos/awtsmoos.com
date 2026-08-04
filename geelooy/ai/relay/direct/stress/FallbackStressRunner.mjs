// B"H
// Boruch Hashem
// Blessed is He

import {
	buildFallbackStressReport,
	validateFallbackStressReport
} from "./FallbackStressReport.mjs";

/**
 * @file Exercises sequential prompt dispatch without sampling any model response.
 * @description
 * The Awtsmoos measures only the delivery vessel: accepted POST, verified prompt,
 * verified target close, and the post-close pacing gate. Each dispatch is independent;
 * the custom GPT continues beyond the test through its own durable tool activity.
 */
export class FallbackStressRunner {
	constructor({
		service,
		counter,
		conversations = 4,
		messages = 5,
		minimumIntervalMs = 18000,
		timeoutMs = 60000,
		onEvent = () => undefined
	} = {}) {
		this.service = service;
		this.counter = counter;
		this.conversations = conversations;
		this.messages = messages;
		this.minimumIntervalMs = Math.max(18000, minimumIntervalMs);
		this.timeoutMs = timeoutMs;
		this.onEvent = onEvent;
	}

	async run() {
		this.validateDependencies();
		const before = await this.counter.read();
		const records = [];
		for (let message = 1; message <= this.messages; message += 1) {
			for (let conversation = 1; conversation <= this.conversations; conversation += 1) {
				const record = await this.executeTurn({ conversation, message });
				records.push(record);
				this.onEvent({ type: "turn-dispatched", completed: records.length, ...record });
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

	async executeTurn({ conversation, message }) {
		let accepted = false;
		const result = await this.service.send({
			prompt: `BH WEBSITE DISPATCH C${conversation} M${message}. Begin the assigned work through durable tools.`,
			mode: "chatgpt-website",
			timeoutMs: this.timeoutMs,
			onProgress: event => {
				if (event.stage === "website-submit" &&
					["accepted", "accepted-response"].includes(event.status)) {
					accepted = true;
				}
				this.onEvent({ type: "progress", conversation, message, ...event });
			}
		});
		const success = result.ok
			&& result.status === 202
			&& result.done === false
			&& result.dispatched === true
			&& result.accepted === true
			&& result.promptVerified === true
			&& result.tabClose?.verified === true
			&& result.composerTouched === true
			&& result.submissionTransport === "chatgpt-website-composer";
		if (!success) {
			const error = new Error("Website dispatch stress turn failed its contract.");
			error.accepted = accepted;
			throw error;
		}
		return {
			conversation,
			message,
			success,
			dispatched: true,
			promptVerified: true,
			tabCloseVerified: true,
			responseStatus: result.responseStatus,
			completionSource: result.completionSource,
			hostReuseSource: result.hostReuseSource,
			intervalMs: result.turnQueue?.minimumIntervalMs ?? null,
			requestLatencyMs: result.requestLatencyMs
		};
	}

	validateDependencies() {
		if (!this.service?.send || !this.counter?.read) {
			throw new TypeError("Website dispatch stress requires a direct service and counter.");
		}
	}
}
