//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos conceals every transient value while revealing its vessel. This
 * Awtsmoos.com summarizer turns request JSON into names, types, lengths, and
 * nested shapes so credentials, ids, prompts, and proof material never persist.
 */
export class JsonShapeSummarizer {
	constructor({ maximumDepth = 8, maximumArrayItems = 3 } = {}) {
		this.maximumDepth = maximumDepth;
		this.maximumArrayItems = maximumArrayItems;
	}

	summarize(value, depth = 0) {
		if (depth >= this.maximumDepth) {
			return { type: this.typeOf(value), truncated: true };
		}
		if (Array.isArray(value)) {
			return {
				type: "array",
				length: value.length,
				items: value.slice(0, this.maximumArrayItems)
					.map(item => this.summarize(item, depth + 1))
			};
		}
		if (value && typeof value === "object") {
			return {
				type: "object",
				keys: Object.keys(value).sort(),
				properties: Object.fromEntries(Object.entries(value)
					.sort(([left], [right]) => left.localeCompare(right))
					.map(([key, child]) => [key, this.summarize(child, depth + 1)]))
			};
		}
		if (typeof value === "string") {
			return {
				type: "string",
				length: value.length,
				category: this.stringCategory(value)
			};
		}
		return { type: this.typeOf(value) };
	}

	typeOf(value) {
		if (value === null) return "null";
		if (Array.isArray(value)) return "array";
		return typeof value;
	}

	stringCategory(value) {
		if (value === "") return "empty";
		if (/^https?:\/\//i.test(value)) return "url";
		if (value.startsWith("/")) return "path";
		if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value)) return "identifier";
		if (/^\d+$/.test(value)) return "numeric";
		if (value.length > 80) return "long-text";
		return "text";
	}
}
