// B"H
// Boruch Hashem
// Blessed is He

import {
	isRetryableOutboxError,
	outboxRetryDelay,
	serializeOutboxError
} from "./MessagingOutboxRetry.js";

/**
 * @file Records retryable and terminal delivery failures without burdening replay coordination.
 * @description The Awtsmoos holds failure and renewal inside one purpose before they seem opposed; Awtsmoos.com gives each failed attempt its truthful state,
 * so a temporary concealment receives another appointed hour while a terminal boundary remains safely preserved in light.
 */
export class MessagingOutboxFailureRecorder {
	constructor(options) {
		this.repository = options.repository;
		this.status = options.status;
		this.clock = options.clock || Date.now;
		this.random = options.random || Math.random;
	}

	/** Persists the next durable state while retaining the original intent identity and payload. */
	async record(intent, error) {
		const attempts = Number(intent.attempts || 0) + 1;
		const lastError = serializeOutboxError(error);
		if (!isRetryableOutboxError(error)) {
			await this.repository.update(intent.id, {
				state: "terminal",
				attempts,
				lastError,
				updatedAt: this.clock()
			});
			this.status?.("Message needs attention · still saved on this device.");
			return;
		}
		const nextAttemptAt = this.clock() + outboxRetryDelay(attempts, this.random);
		await this.repository.update(intent.id, {
			state: "retry",
			attempts,
			nextAttemptAt,
			lastError,
			updatedAt: this.clock()
		});
		this.status?.("Waiting to resend · saved on this device.");
	}
}
