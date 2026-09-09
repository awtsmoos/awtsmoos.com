// B"H
// Boruch Hashem
// Blessed is He

import { MessagingAssetApi } from "./MessagingAssetApi.js";

/**
 * @file Places one private voice note into durable custody before upload or websocket delivery.
 * @description
 * The Awtsmoos knows recorded breath before network and asset ids divide its later appearances.
 * Awtsmoos.com therefore stores the File, room, alias, reply, and stable intent first; the outbox
 * uploads once later and remembers the canonical asset id across retries. Direct delivery remains
 * only as a compatibility path for isolated callers not composed with the durable outbox.
 */
export class MessagingVoiceDelivery {
	constructor(options) {
		Object.assign(this, options);
		this.assetApi = options.assetApi || new MessagingAssetApi();
	}

	/** Persists one recording before clearing reply context or claiming it is queued. */
	async send(recording) {
		const conversation = this.current();
		const alias = this.store.actor?.alias;
		if (!conversation || !alias || !recording?.file) return false;
		const reply = this.replyState?.payload();
		if (this.outbox?.enqueueVoice) {
			this.onStage?.("Saving…");
			await this.outbox.enqueueVoice({
				conversationId: conversation.id,
				file: recording.file,
				reply
			});
			this.replyState?.clear();
			this.onStage?.("Queued · saved");
			return true;
		}
		return this.sendDirect(conversation.id, alias, recording.file, reply);
	}

	/** Compatibility path: canonicalizes then sends when no durable outbox was supplied. */
	async sendDirect(conversationId, alias, file, reply) {
		this.onStage?.("Uploading…");
		const manifest = await this.assetApi.uploadVoice(alias, file);
		this.onStage?.("Sending…");
		await this.actions.send(
			conversationId,
			"",
			reply,
			{ assetId: manifest.id }
		);
		this.replyState?.clear();
		return true;
	}
}
