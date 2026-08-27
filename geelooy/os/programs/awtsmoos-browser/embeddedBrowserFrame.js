//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedBrowserFrame
 * @description The Awtsmoos hangs one transparent vessel inside the OS window;
 * Awtsmoos.com grants script-life but withholds origin, popup, form, download, and
 * navigation authority, while fresh cryptographic names guard each channel of light.
 */

import { buildEmbeddedGuestDocument } from "./embeddedGuestDocument.js";

const SANDBOX_TOKENS = "allow-scripts";

export class EmbeddedBrowserFrame {
	constructor(options = {}) {
		this.documentObject = options.documentObject || globalThis.document;
		this.cryptoObject = options.cryptoObject || globalThis.crypto;
		this.channelId = options.channelId || createEmbeddedSecret("guest", this.cryptoObject);
		this.scriptNonce = options.scriptNonce || createEmbeddedSecret("nonce", this.cryptoObject);
		this.title = options.title || "Awtsmoos Browser page";
		this.iframe = this.createIframe();
	}

	attach(container) {
		if (!container?.append) throw new TypeError("BROWSER_EMBEDDED_CONTAINER_REQUIRED");
		container.append(this.iframe);
		return this.iframe;
	}

	reload(title = this.title) {
		this.title = title;
		this.iframe.srcdoc = this.guestDocument();
	}

	destroy() {
		this.iframe.remove?.();
	}

	createIframe() {
		if (!this.documentObject?.createElement) {
			throw new TypeError("BROWSER_EMBEDDED_DOCUMENT_REQUIRED");
		}
		const iframe = this.documentObject.createElement("iframe");
		iframe.className = "awtsmoos-browser-embedded-frame";
		iframe.setAttribute("sandbox", SANDBOX_TOKENS);
		iframe.setAttribute("referrerpolicy", "no-referrer");
		iframe.setAttribute("aria-label", this.title);
		iframe.setAttribute("loading", "eager");
		iframe.srcdoc = this.guestDocument();
		return iframe;
	}

	guestDocument() {
		return buildEmbeddedGuestDocument({
			channelId: this.channelId,
			scriptNonce: this.scriptNonce,
			title: this.title
		});
	}
}

export function embeddedSandboxTokens() {
	return SANDBOX_TOKENS;
}

export function createEmbeddedChannelId(cryptoObject = globalThis.crypto) {
	return createEmbeddedSecret("guest", cryptoObject);
}

export function createEmbeddedScriptNonce(cryptoObject = globalThis.crypto) {
	return createEmbeddedSecret("nonce", cryptoObject);
}

function createEmbeddedSecret(prefix, cryptoObject) {
	if (typeof cryptoObject?.randomUUID === "function") {
		return `${prefix}_${cryptoObject.randomUUID().replace(/-/g, "")}`;
	}
	if (typeof cryptoObject?.getRandomValues === "function") {
		const bytes = new Uint8Array(18);
		cryptoObject.getRandomValues(bytes);
		const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
		return `${prefix}_${hex}`;
	}
	throw new Error("BROWSER_EMBEDDED_SECURE_RANDOM_REQUIRED");
}
