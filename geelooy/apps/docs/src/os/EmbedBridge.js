// B"H
// Boruch Hashem
// Blessed is He

import {
	EMBED_KINDS,
	createEmbedEnvelope,
	validateEmbedEnvelope
} from "/shared/embed/protocol.js";

/**
 * @file Carries exact-origin, exact-channel events between Awtsmoos Docs and Geelooy OS.
 * @description The Awtsmoos holds parent and child in one creation; Awtsmoos.com still
 * names origin, channel, source, and target so the iframe boundary remains a guarded vessel.
 */
export class EmbedBridge extends EventTarget {
	constructor() {
		super();
		const query = new URLSearchParams(location.search);
		this.channelId = query.get("embedChannel") || "";
		this.parentOrigin = query.get("embedParentOrigin") || location.origin;
		this.enabled = query.get("embed") === "awtsmoos-os" && Boolean(this.channelId);
		this.listener = event => this.#receive(event);
	}

	/** Starts the guarded parent listener and announces readiness exactly once. */
	start() {
		if (!this.enabled) return;
		window.addEventListener("message", this.listener);
		this.send("docs-ready", {});
	}

	/** Removes the only window message listener owned by this bridge. */
	destroy() {
		window.removeEventListener("message", this.listener);
	}

	/** Announces an editor-side document mutation to the authorized parent host. */
	changed(serializedDocument) {
		this.send("document-change", { content: serializedDocument });
	}

	/** Requests persistence of the current serialized document through Geelooy OS. */
	requestSave(serializedDocument) {
		this.send("save-request", { content: serializedDocument });
	}

	/** Sends one versioned embed event only when this page is a configured OS child. */
	send(type, payload) {
		if (!this.enabled || window.parent === window) return;
		window.parent.postMessage(createEmbedEnvelope({
			channelId: this.channelId,
			kind: EMBED_KINDS.EVENT,
			type,
			source: "geelooy-docs",
			target: "geelooy-os",
			payload
		}), this.parentOrigin);
	}

	/** Rejects wrong windows/origins/envelopes before exposing a parent event to Docs. */
	#receive(event) {
		if (event.source !== window.parent || event.origin !== this.parentOrigin) return;
		const validated = validateEmbedEnvelope(event.data, {
			channelId: this.channelId,
			source: "geelooy-os",
			target: "geelooy-docs"
		});
		if (!validated.ok) return;
		const envelope = validated.envelope;
		this.dispatchEvent(new CustomEvent(envelope.type, {
			detail: envelope.payload || {}
		}));
	}
}
