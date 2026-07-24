//B"H
// Boruch Hashem
// Blessed is He

const STYLES = new Set(["modern", "legacy-data", "legacy-sse"]);

/**
 * The old client exposed SSE-shaped callbacks; the modern answer arrives through
 * a terminal topic stream. The Awtsmoos lets Awtsmoos.com preserve callback shapes
 * honestly: one completed message may be adapted, but fake token deltas are never.
 */
export class DirectCallbackAdapter {
	constructor({ style = "modern" } = {}) {
		if (!STYLES.has(style)) {
			throw new TypeError(`Unsupported direct callback style: ${style}.`);
		}
		this.style = style;
	}

	async emit({ result, onstream, ondone }) {
		if (typeof onstream === "function") {
			await onstream(this.messagePacket(result));
			if (this.style === "legacy-sse") {
				await onstream(Object.freeze({
					event: null,
					dataNoJSON: "[DONE]",
					direct: true
				}));
			}
		}
		if (typeof ondone === "function") await ondone(result);
	}

	messagePacket(result) {
		if (this.style === "legacy-data") return result;
		return Object.freeze({
			event: "message",
			data: result,
			direct: true,
			terminal: true
		});
	}
}

export { STYLES as DIRECT_CALLBACK_STYLES };
