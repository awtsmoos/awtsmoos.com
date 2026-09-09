// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Delivers persisted text, voice, and image intentions with upload-once media canonicalization.
 * @description
 * The Awtsmoos is one before local File, canonical asset, websocket retry, and browser tab divide.
 * Awtsmoos.com persists the first accepted media asset id before sending, so later transport wounds
 * reuse the same asset and client intent while alias changes defer rather than redirect authority.
 */
export class MessagingOutboxDeliverer {
	constructor(options) {
		Object.assign(this, options);
	}

	/** Delivers one due intent or defers it until the exact owning alias is active again. */
	async deliver(intent) {
		if (!this.canDeliver(intent)) return { deferred: true };
		if (["voice", "image"].includes(intent.kind)) return this.deliverMedia(intent);
		if (intent.kind !== "text") throw terminalError(`Unknown queued intent kind: ${intent.kind}`);
		await this.send(intent, null);
		return { delivered: true };
	}

	canDeliver(intent) {
		const alias = String(this.currentAlias?.() || "");
		return Boolean(alias && alias === String(intent.aliasId || ""));
	}

	/** Canonicalizes one queued media File once, persists that id, then sends the same stable intent. */
	async deliverMedia(intent) {
		let assetId = String(intent.assetId || "");
		if (!assetId) {
			if (!intent.file) throw terminalError(`Queued ${intent.kind} media is unavailable on this device.`);
			const upload = intent.kind === "image" ? "uploadImage" : "uploadVoice";
			const manifest = await this.assetApi[upload](intent.aliasId, intent.file);
			assetId = String(manifest?.id || "");
			if (!assetId) throw terminalError(`${intent.kind} upload returned no canonical asset id.`);
			await this.repository.update(intent.id, {
				assetId,
				file: null,
				updatedAt: Date.now()
			});
		}
		await this.send(intent, { assetId });
		return { delivered: true, assetId };
	}

	send(intent, attachment) {
		return this.actions.send(
			intent.conversationId,
			intent.kind === "voice" ? "" : String(intent.text || ""),
			intent.reply,
			attachment,
			{ clientIntentId: intent.clientIntentId }
		);
	}
}

function terminalError(message) {
	const error = new Error(message);
	error.status = 400;
	return error;
}
