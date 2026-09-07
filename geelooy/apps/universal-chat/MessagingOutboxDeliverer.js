// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Delivers one persisted Universal Chat intent, uploading voice media once and always reusing the same server idempotency identity.
 * @description The Awtsmoos is one before local file, canonical asset, and private message divide; Awtsmoos.com remembers the first accepted asset in light,
 * so a websocket wound may repeat the send without repeating the upload, while an alias change defers authority instead of redirecting another person's vessel.
 */

export class MessagingOutboxDeliverer {
	constructor(options) {
		Object.assign(this, options);
	}

	/** Delivers one due intent or defers it until its owning alias is active again. */
	async deliver(intent) {
		if (!this.canDeliver(intent)) return { deferred: true };
		if (intent.kind === "voice") return this.deliverVoice(intent);
		await this.actions.send(
			intent.conversationId,
			intent.text,
			intent.reply,
			null,
			{ clientIntentId: intent.clientIntentId }
		);
		return { delivered: true };
	}

	canDeliver(intent) {
		const alias = String(this.currentAlias?.() || "");
		return Boolean(alias && alias === String(intent.aliasId || ""));
	}

	async deliverVoice(intent) {
		let assetId = String(intent.assetId || "");
		if (!assetId) {
			if (!intent.file) throw new Error("Queued voice media is unavailable on this device.");
			const manifest = await this.assetApi.uploadVoice(intent.aliasId, intent.file);
			assetId = String(manifest.id || "");
			if (!assetId) throw new Error("Voice upload did not return a canonical asset id.");
			await this.repository.update(intent.id, {
				assetId,
				file: null,
				updatedAt: Date.now()
			});
		}
		await this.actions.send(
			intent.conversationId,
			"",
			intent.reply,
			{ assetId },
			{ clientIntentId: intent.clientIntentId }
		);
		return { delivered: true, assetId };
	}
}
