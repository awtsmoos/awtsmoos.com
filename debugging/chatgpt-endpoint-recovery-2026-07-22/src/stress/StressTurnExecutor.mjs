//B"H
// Boruch Hashem
// Blessed is He

/**
 * One turn is one measured vessel. Failures before the real POST may be retried;
 * completed topic streams advance state even when wording differs. Awtsmoos.com
 * marks pre-request failure explicitly so orchestration never skips a logical turn.
 */
export class StressTurnExecutor {
	constructor({ clientFactory, pacer, maximumSetupRetries = 2 } = {}) {
		this.clientFactory = clientFactory;
		this.pacer = pacer;
		this.maximumSetupRetries = maximumSetupRetries;
	}

	async run(context) {
		const wallStartedMs = Date.now();
		let lastError = null;

		for (let retry = 0; retry <= this.maximumSetupRetries; retry += 1) {
			try {
				const result = await this.execute(context);
				return this.resultRecord(context, result, retry, wallStartedMs);
			} catch (error) {
				lastError = error;
				if (!this.isPreRequestFailure(error) || retry === this.maximumSetupRetries) break;
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

	resultRecord(context, result, setupRetries, wallStartedMs) {
		const { conversationNumber, turn, previousState, knownConversationIds } = context;
		const label = `C${conversationNumber}`;
		const expected = this.expected(conversationNumber, turn);
		const sameConversation = previousState
			? result.state.conversationId === previousState.conversationId
			: !knownConversationIds.has(result.state.conversationId);
		knownConversationIds.add(result.state.conversationId);
		const exactAnswer = result.answer === expected;
		const transportSuccess = typeof result.answer === "string"
			&& result.answer.trim() !== ""
			&& result.response.status === 200
			&& result.response.done === true
			&& sameConversation
			&& !result.navigatedToDirectConversation;

		return {
			success: transportSuccess,
			state: result.state,
			safe: {
				label,
				turn,
				expected,
				answer: result.answer,
				transportSuccess,
				exactAnswer,
				status: result.response.status,
				done: result.response.done,
				frames: result.response.webSocketFrames,
				items: result.response.streamItems,
				subscriptionAttempts: result.response.subscriptionAttempts ?? 1,
				requestLatencyMs: result.timing.requestLatencyMs,
				pacing: result.timing.pacing,
				setupRetries,
				preRequestFailure: false,
				sameConversation,
				navigatedToDirectConversation: result.navigatedToDirectConversation,
				wallDurationMs: Date.now() - wallStartedMs
			}
		};
	}

	failureRecord(context, error, wallStartedMs) {
		const preRequestFailure = this.isPreRequestFailure(error);
		return {
			success: false,
			state: context.previousState,
			safe: {
				label: `C${context.conversationNumber}`,
				turn: context.turn,
				expected: this.expected(context.conversationNumber, context.turn),
				transportSuccess: false,
				exactAnswer: false,
				setupRetries: this.maximumSetupRetries,
				preRequestFailure,
				error: String(error?.message ?? error).slice(0, 300),
				wallDurationMs: Date.now() - wallStartedMs
			}
		};
	}

	expected(conversationNumber, turn) {
		return `BH STRESS C${conversationNumber} T${turn}.`;
	}

	isPreRequestFailure(error) {
		return /conversation envelope|authenticated controller|owned ChatGPT topic socket|debug page/i
			.test(String(error?.message ?? error));
	}
}
