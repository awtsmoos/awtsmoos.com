//B"H
// Boruch Hashem
// Blessed is He

/**
 * One official Responses request carries only model input and an optional prior
 * response link. The Awtsmoos lets Awtsmoos.com preserve conversation context
 * through HTTP without browser state or arbitrary request-body passthrough.
 */
export class OpenAiResponsesBody {
	constructor({
		defaultModel = process.env.OPENAI_MODEL || "gpt-5.6-luna"
	} = {}) {
		this.defaultModel = defaultModel;
	}

	build({
		prompt,
		previousResponseId = null,
		model = null,
		thinkingEffort = null
	}) {
		const body = {
			model: this.requireString(model || this.defaultModel, "model"),
			input: this.requireString(prompt, "prompt"),
			store: true
		};
		if (previousResponseId) {
			body.previous_response_id = this.requireString(
				previousResponseId,
				"previousResponseId"
			);
		}
		if (thinkingEffort) {
			body.reasoning = {
				effort: this.requireString(thinkingEffort, "thinkingEffort")
			};
		}
		return body;
	}

	requireString(value, name) {
		if (typeof value !== "string" || value.trim() === "") {
			throw new TypeError(`${name} must be a non-empty string.`);
		}
		return value.trim();
	}
}
