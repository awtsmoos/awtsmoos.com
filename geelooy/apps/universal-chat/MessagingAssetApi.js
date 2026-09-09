// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Uploads private-chat media through the existing alias-owned Social asset covenant.
 * @description
 * The Awtsmoos gives a local File no authority merely because a browser created it. Awtsmoos.com
 * sends voice and image through one private-message upload gate, then accepts only the canonical
 * manifest type expected by the caller before any private message may refer to that asset.
 */
export class MessagingAssetApi {
	constructor(fetcher = globalThis.fetch?.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	/** Uploads one private voice recording and returns its canonical audio manifest. */
	uploadVoice(aliasId, file) {
		return this.uploadPrivateAsset(aliasId, file, "audio", "Voice note");
	}

	/** Uploads one private image and returns its canonical image manifest. */
	uploadImage(aliasId, file) {
		return this.uploadPrivateAsset(aliasId, file, "image", "Image");
	}

	/** Uploads one allowlisted Social asset while preserving the private-message marker. */
	async uploadPrivateAsset(aliasId, file, expectedType, label) {
		if (!this.fetcher) throw new Error("Asset upload is unavailable in this browser.");
		if (!aliasId || !file) throw new Error(`Alias and ${label.toLowerCase()} are required.`);
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
				|| `${label} upload failed.`
			);
		}
		const manifests = Array.isArray(payload?.success)
			? payload.success
			: Array.isArray(payload)
				? payload
				: [];
		const manifest = manifests[0] || payload?.success || null;
		if (!manifest?.id || manifest.type !== expectedType) {
			throw new Error(`${label} upload did not return a valid ${expectedType} asset.`);
		}
		return manifest;
	}
}
