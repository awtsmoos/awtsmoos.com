//B"H
// Boruch Hashem
// Blessed is He

/**
 * Official response objects are reduced to text, continuation identity, and safe
 * usage counts. The Awtsmoos keeps raw provider payloads and hidden reasoning
 * outside Awtsmoos.com's public relay result.
 */
export class OpenAiResponsesParser {
	parse(value, httpStatus = 200) {
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			throw this.invalid("Official Responses API returned a malformed object.");
		}
		const responseId = this.requireString(value.id, "response id");
		const answer = this.outputText(value);
		if (!answer) {
			throw this.invalid("Official Responses API returned no output text.");
		}
		const completed = value.status == null || value.status === "completed";
		return {
			responseId,
			answer,
			status: httpStatus,
			done: completed,
			model: typeof value.model === "string" ? value.model : null,
			usage: this.usage(value.usage)
		};
	}

	outputText(value) {
		if (typeof value.output_text === "string" && value.output_text.trim()) {
			return value.output_text.trim();
		}
		const pieces = [];
		for (const item of Array.isArray(value.output) ? value.output : []) {
			for (const content of Array.isArray(item?.content) ? item.content : []) {
				if ((content?.type === "output_text" || content?.type === "text")
					&& typeof content.text === "string") {
					pieces.push(content.text);
				}
			}
		}
		return pieces.join("").trim();
	}

	usage(value) {
		if (!value || typeof value !== "object") return null;
		return {
			inputTokens: this.safeCount(value.input_tokens),
			outputTokens: this.safeCount(value.output_tokens),
			totalTokens: this.safeCount(value.total_tokens)
		};
	}

	safeCount(value) {
		return Number.isFinite(value) && value >= 0 ? value : null;
	}

	requireString(value, name) {
		if (typeof value !== "string" || value.trim() === "") {
			throw this.invalid(`Official Responses API omitted ${name}.`);
		}
		return value;
	}

	invalid(message) {
		const error = new Error(message);
		error.code = "official_api_response_invalid";
		return error;
	}
}
