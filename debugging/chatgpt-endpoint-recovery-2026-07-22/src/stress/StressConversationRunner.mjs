//B"H
// Boruch Hashem
// Blessed is He

import { PageAuthorizedDirectClient } from "../chatgpt/PageAuthorizedDirectClient.mjs";
import { RequestPacer } from "./RequestPacer.mjs";
import { StressTurnExecutor } from "./StressTurnExecutor.mjs";

/**
 * Many conversations remain distinct sparks within one measured procession. The
 * Awtsmoos joins their purpose; awtsmoos.com verifies safe pacing and continuity
 * while transient conversation identifiers remain only in memory.
 */
export class StressConversationRunner {
	constructor({
		port = 9226,
		conversationCount = 5,
		continuationCount = 6,
		minimumIntervalMs = 7000,
		clientFactory,
		pacer,
		onProgress
	} = {}) {
		this.port = port;
		this.conversationCount = conversationCount;
		this.continuationCount = continuationCount;
		this.clientFactory = clientFactory ?? (() => new PageAuthorizedDirectClient({ port }));
		this.pacer = pacer ?? new RequestPacer({ minimumIntervalMs });
		this.onProgress = onProgress;
		this.executor = new StressTurnExecutor({
			clientFactory: this.clientFactory,
			pacer: this.pacer
		});
	}

	async run() {
		const states = Array.from({ length: this.conversationCount }, () => null);
		const knownConversationIds = new Set();
		const turns = [];
		let consecutiveFailures = 0;
		const startedAt = new Date().toISOString();

		for (let turn = 1; turn <= this.continuationCount + 1; turn += 1) {
			for (let index = 0; index < this.conversationCount; index += 1) {
				const record = await this.executor.run({
					conversationNumber: index + 1,
					turn,
					previousState: states[index],
					knownConversationIds
				});
				turns.push(record.safe);
				await this.onProgress?.(record.safe, turns);

				if (record.success) {
					states[index] = record.state;
					consecutiveFailures = 0;
				} else {
					consecutiveFailures += 1;
					if (consecutiveFailures >= 2) {
						return this.summarize({ startedAt, turns, aborted: true });
					}
				}
			}
		}

		return this.summarize({ startedAt, turns, aborted: false });
	}

	summarize({ startedAt, turns, aborted }) {
		const intervals = turns
			.map((turn) => turn.pacing?.intervalMs)
			.filter(Number.isFinite);

		return {
			BH: "B\"H — Boruch Hashem — Blessed is He",
			startedAt,
			finishedAt: new Date().toISOString(),
			configuration: {
				conversationCount: this.conversationCount,
				continuationsPerConversation: this.continuationCount,
				totalPlannedRequests: this.conversationCount * (this.continuationCount + 1),
				minimumIntervalMs: this.pacer.minimumIntervalMs
			},
			aborted,
			totalCompleted: turns.length,
			totalSucceeded: turns.filter((turn) => turn.success).length,
			minimumObservedIntervalMs: intervals.length > 0 ? Math.min(...intervals) : null,
			turns
		};
	}
}
