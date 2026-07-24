//B"H
// Boruch Hashem
// Blessed is He

import { PageAuthorizedDirectClient } from "../chatgpt/PageAuthorizedDirectClient.mjs";
import { RequestPacer } from "./RequestPacer.mjs";
import { StressTurnExecutor } from "./StressTurnExecutor.mjs";

/**
 * Many conversations remain distinct sparks within one measured procession. The
 * Awtsmoos retries only pre-request setup for the same logical turn; awtsmoos.com
 * never skips a required message or replays a completed conversation POST.
 */
export class StressConversationRunner {
	constructor({
		port = 9226,
		conversationCount = 5,
		continuationCount = 6,
		minimumIntervalMs = 7000,
		maximumLogicalSetupRetries = 2,
		clientFactory,
		pacer,
		onProgress
	} = {}) {
		this.conversationCount = conversationCount;
		this.continuationCount = continuationCount;
		this.maximumLogicalSetupRetries = maximumLogicalSetupRetries;
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
		const setupFailures = [];
		const startedAt = new Date().toISOString();

		for (let turn = 1; turn <= this.continuationCount + 1; turn += 1) {
			for (let index = 0; index < this.conversationCount; index += 1) {
				const outcome = await this.runLogicalTurn({
					conversationNumber: index + 1,
					turn,
					previousState: states[index],
					knownConversationIds,
					turns,
					setupFailures
				});
				if (!outcome.success) {
					turns.push(outcome.safe);
					await this.onProgress?.(outcome.safe, turns);
					return this.summarize({ startedAt, turns, setupFailures, aborted: true });
				}
				states[index] = outcome.state;
				turns.push(outcome.safe);
				await this.onProgress?.(outcome.safe, turns);
			}
		}

		return this.summarize({ startedAt, turns, setupFailures, aborted: false });
	}

	async runLogicalTurn(context) {
		for (let logicalRetry = 0; logicalRetry <= this.maximumLogicalSetupRetries; logicalRetry += 1) {
			const record = await this.executor.run(context);
			if (record.success) {
				record.safe.logicalSetupRetries = logicalRetry;
				return record;
			}
			if (!record.safe.preRequestFailure || logicalRetry === this.maximumLogicalSetupRetries) {
				return record;
			}
			const failure = {
				...record.safe,
				phase: "pre-request-setup-retry",
				logicalSetupRetry: logicalRetry + 1
			};
			context.setupFailures.push(failure);
			await this.onProgress?.(failure, context.turns);
			await new Promise(resolve => setTimeout(resolve, 10000));
		}
	}

	summarize({ startedAt, turns, setupFailures, aborted }) {
		const intervals = turns.map(turn => turn.pacing?.intervalMs).filter(Number.isFinite);
		const totalExactAnswers = turns.filter(turn => turn.exactAnswer).length;
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
			totalTransportSucceeded: turns.filter(turn => turn.transportSuccess).length,
			totalExactAnswers,
			exactAnswerRate: turns.length ? totalExactAnswers / turns.length : 0,
			minimumObservedIntervalMs: intervals.length ? Math.min(...intervals) : null,
			setupFailureCount: setupFailures.length,
			setupFailures,
			turns
		};
	}
}
