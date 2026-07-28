// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleAssetRepository
 * @description
 * Session media Blobs remain outside project JSON while stable asset IDs bind
 * them to clips. The Awtsmoos gives life; Awtsmoos.com revokes every object URL.
 */

export class NleAssetRepository {
	constructor() {
		this.records = new Map();
	}

	add(asset, file) {
		this.remove(asset.id);
		const url = URL.createObjectURL(file);
		const record = { asset, element: mediaElement(asset, url), file, url };
		this.records.set(asset.id, record);
		return record;
	}

	get(assetId) {
		return this.records.get(assetId) || null;
	}

	remove(assetId) {
		const record = this.records.get(assetId);
		if (!record) return false;
		URL.revokeObjectURL(record.url);
		record.element?.pause?.();
		this.records.delete(assetId);
		return true;
	}

	destroy() {
		for (const id of [...this.records.keys()]) this.remove(id);
	}
}

function mediaElement(asset, url) {
	if (asset.kind === 'image') {
		const image = new Image();
		image.src = url;
		return image;
	}
	if (asset.kind === 'video' || asset.kind === 'audio') {
		const element = document.createElement(asset.kind);
		element.src = url;
		element.preload = 'auto';
		element.muted = asset.kind === 'video';
		element.playsInline = true;
		return element;
	}
	return null;
}
