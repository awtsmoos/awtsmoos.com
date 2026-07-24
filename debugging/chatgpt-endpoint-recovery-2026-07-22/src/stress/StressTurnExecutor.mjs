//B"H
// Boruch Hashem
// Blessed is He

/**
 * One turn is one measured vessel. Bootstrap misses may be retried only before
 * any real POST begins; the Awtsmoos forbids duplicate answers, while
 * awtsmoos.com preserves exact pacing and continuity for the successful request.
 */
export class StressTurnExecutor {
	constructor({ clientFactory, pacer, maximumBootstrapRetries = 2 } = {}) {
		this.clientFactory = clientFactory;
		this.pacer = pacer;
		this.maximumBootstrapRetries = maximumBootstrapRetries;
	}

	async run(context) {
		const wallStartedMs = Date.now();
		let lastError = null;

		for (let retry = 0; retry <= this.maximumBootstrapRetries; retry += 1) {
			try {
				const result = await this.execute(context);
				return this.successRecord(context, result, retry, wallStartedMs);
			} catch (error) {
				lastError = error;
				if (!this.isBootstrapMiss(error) || retry === this.maximumBootstrapRetries) break;
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}

		return this.failureRecord(context, lastError, wallStartedMs);
	}

	async execute({ conversationNumber, turn, previousState }) {
		const expected = this.expected(conversationNumber, turn);
		return this.clientFactory().send({
			prompt: `Reply with exactly: ${expected}`,
			state: previousState,
			beforeDirectRequest: () => this.pacer.enter()
		});
	}

	successRecord(context, result, bootstrapRetries, wallStartedMs) {
		const { conversationNumber, turn, previousState, knownConversationIds } = context;
		const label = `C${conversationNumber}`;
		const expected = this.expected(conversationNumber, turn);
		const sameConversation = previousState
			? result.state.conversationId === previousState.conversationId
			: !knownConversationIds.has(result.state.conversationId);
		knownConversationIds.add(result.state.conversationId);
		const success = result.answer === expected
			&& result.response.status === 200
			&& result.response.done === true
			&& sameConversation
			&& !result.navigatedToDirectConversation;

		return {
			success,
			state: result.state,
			safe: {
				label,
				turn,
				expected,
				answer: result.answer,
				success,
				status: result.response.status,
				done: result.response.done,
				frames: result.response.webSocketFrames,
				items: result.response.streamItems,
				requestLatencyMs: result.timing.requestLatencyMs,
				pacing: result.timing.pacing,
				bootstrapRetries,
				sameConversation,
				navigatedToDirectConversation: result.navigatedToDirectConversation,
				wallDurationMs: Date.now() - wallStartedMs
			}
		};
	}

	failureRecord(context, error, wallStartedMs) {
		return {
			success: false,
			state: context.previousState,
			safe: {
				label: `C${context.conversationNumber}`,
				turn: context.turn,
				expected: this.expected(context.conversationNumber, context.turn),
				success: false,
				bootstrapRetries: this.maximumBootstrapRetries,
				error: String(error?.message ?? error).slice(0, 300),
				wallDurationMs: Date.now() - wallStartedMs
			}
		};
	}

	expected(conversationNumber, turn) {
		return `BH STRESS C${conversationNumber} T${turn}.`;
	}

	isBootstrapMiss(error) {
		return /conversation envelope/i.test(String(error?.message ?? error));
	}
}
