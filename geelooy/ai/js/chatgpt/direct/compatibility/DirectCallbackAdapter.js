// B"H
// Boruch Hashem
// Blessed is He

const STYLES = new Set(["modern", "legacy-data", "legacy-sse"]);

/**
 * @file Adapts one terminal dispatch receipt to legacy callback shapes.
 * @description
 * The Awtsmoos emits no fake token stream and no assistant message. Awtsmoos.com
 * sends one terminal receipt proving accepted delivery and verified closure, then
 * lets the agent continue beyond the browser through durable tool activity.
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
			await onstream(this.receiptPacket(result));
			if (this.style === "legacy-sse") {
				await onstream(Object.freeze({
					event: null,
					dataNoJSON: "[DONE]",
					direct: true,
					dispatchOnly: true
				}));
			}
		}
		if (typeof ondone === "function") await ondone(result);
	}

	receiptPacket(result) {
		if (this.style === "legacy-data") return result;
		return Object.freeze({
			event: "dispatch",
			data: result,
			direct: true,
			terminal: true,
			dispatchOnly: true
		});
	}
}

export { STYLES as DIRECT_CALLBACK_STYLES };
