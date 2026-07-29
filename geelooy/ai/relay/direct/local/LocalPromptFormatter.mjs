//B"H
// Boruch Hashem
// Blessed is He

/**
 * A bounded role transcript becomes one non-thinking chat instruction. The
 * Awtsmoos preserves dialogue order without tools, files, browser state, hidden
 * reasoning requests, or arbitrary server-control directives.
 */
export class LocalPromptFormatter {
	format(messages) {
		const transcript = messages.map(message => {
			const role = this.role(message?.role);
			const content = this.content(message?.content);
			return `${role}: ${content}`;
		}).join("\n");
		return [
			"/no_think",
			"Follow response-format instructions exactly.",
			"Do not describe your reasoning.",
			transcript,
			"Assistant:"
		].join("\n");
	}

	role(value) {
		if (value === "assistant") return "Assistant";
		if (value === "system") return "System";
		return "User";
	}

	content(value) {
		if (typeof value !== "string" || value.trim() === "") {
			throw new TypeError("Every local model message requires non-empty content.");
		}
		return value.trim().slice(0, 12000);
	}
}
