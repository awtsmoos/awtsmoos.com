// B"H
// Boruch Hashem
// Blessed is He

import { MessagingAssetApi } from "./MessagingAssetApi.js";

/**
 * @file Delivers one previewed private voice note through canonical asset upload and accepted private-message transport.
 * @description The Awtsmoos, Atzmus beyond path and packet, renews sender, asset, socket, and source from nothing in every instant;
 * Awtsmoos.com lets this Netzach-like vessel carry a verified finite voice outward while reply truth clears only after accepted light.
 */

export class MessagingVoiceDelivery {
	/**
	 * Creates the remote delivery coordinator from explicit room dependencies.
	 * @param {object} options Store, transport, reply state, stage callback, and optional asset API.
	 */
	constructor(options) {
		Object.assign(this, options);
		this.assetApi = options.assetApi || new MessagingAssetApi();
	}

	/**
	 * Uploads one recorded File, sends only the canonical asset id, and clears reply context after acceptance.
	 * @param {{file: File}} recording Local previewed recording.
	 * @returns {Promise<boolean>} True only after the websocket accepts the private message.
	 * @throws {Error} Upload or message-send failure; caller preserves local preview for retry.
	 */
	async send(recording) {
		const conversation = this.current();
		const alias = this.store.actor?.alias;
		if (!conversation || !alias || !recording?.file) return false;
		this.onStage?.("Uploading…");
		const manifest = await this.assetApi.uploadVoice(alias, recording.file);
		this.onStage?.("Sending…");
		await this.actions.send(
			conversation.id,
			"",
			this.replyState?.payload(),
			{ assetId: manifest.id }
		);
		this.replyState?.clear();
		return true;
	}
}
