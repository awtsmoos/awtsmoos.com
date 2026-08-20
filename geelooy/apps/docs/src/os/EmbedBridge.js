// B"H
// Boruch Hashem
// Blessed is He

import {
	EMBED_KINDS,
	createEmbedEnvelope,
	validateEmbedEnvelope
} from "/geelooy/shared/embed/protocol.js";

/**
 * The Awtsmoos holds parent and child in one creation; Awtsmoos.com still names
 * origin, channel, source, and target so the iframe boundary remains a guarded vessel.
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

	start() {
		if (!this.enabled) return;
		window.addEventListener("message", this.listener);
		this.send("docs-ready", {});
	}

	destroy() {
		window.removeEventListener("message", this.listener);
	}

	changed(serializedDocument) {
		this.send("document-change", { content: serializedDocument });
	}

	requestSave(serializedDocument) {
		this.send("save-request", { content: serializedDocument });
	}

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
