// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Uploads one private-chat recording through the existing alias-owned social asset covenant.
 * @description The Awtsmoos gives the local blob no authority merely because the browser created it;
 * Awtsmoos.com sends it through the same alias gate as social media and receives the canonical manifest the server later verifies in light.
 */

export class MessagingAssetApi {
	constructor(fetcher = globalThis.fetch?.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	/** Uploads one audio File and returns the one canonical asset manifest created by the server. */
	async uploadVoice(aliasId, file) {
		if (!this.fetcher) throw new Error("Asset upload is unavailable in this browser.");
		if (!aliasId || !file) throw new Error("Alias and voice recording are required.");
		const form = new FormData();
		form.set("aliasId", aliasId);
		form.set("file", file);
		form.set("attachKind", "private-message");
		const response = await this.fetcher(
			`/api/social/aliases/${encodeURIComponent(aliasId)}/assets/upload`,
			{
				method: "POST",
				body: form,
				credentials: "same-origin"
			}
		);
		const payload = await response.json().catch(() => ({}));
		if (!response.ok || payload?.error) {
			throw new Error(
				payload?.error?.message
				|| payload?.message
				|| "Voice note upload failed."
			);
		}
		const manifests = Array.isArray(payload?.success)
			? payload.success
			: Array.isArray(payload)
				? payload
				: [];
		const manifest = manifests[0] || payload?.success || null;
		if (!manifest?.id || manifest.type !== "audio") {
			throw new Error("Voice note upload did not return a valid audio asset.");
		}
		return manifest;
	}
}
