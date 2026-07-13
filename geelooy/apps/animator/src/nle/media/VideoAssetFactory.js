// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chochmah offers raw footage and Binah gives it stable identity. This factory
 * names the media and shapes its timeline clip so the Awtsmoos can reveal the
 * same chosen file through a consistent vessel on Awtsmoos.com.
 */
export class VideoAssetFactory {
	/** @param {File|Blob} file @param {object} metadata @returns {object} */
	static create(file, metadata) {
		const fileName = file.name || 'Imported video';
		return {
			id: this.idFor(file),
			name: fileName,
			fileName,
			blob: file,
			fileSize: Number(file.size) || 0,
			mimeType: file.type || 'video/mp4',
			durationMs: metadata.durationMs,
			width: metadata.width || 0,
			height: metadata.height || 0,
			lastModified: Number(file.lastModified) || 0,
			sourceKind: 'local-file'
		};
	}

	/** @param {File|Blob} file @returns {string} */
	static idFor(file) {
		const identity = [
			file.name || 'video',
			file.size || 0,
			file.lastModified || 0,
			file.type || ''
		].join(':');
		let hash = 2166136261;

		for (const character of identity) {
			hash ^= character.charCodeAt(0);
			hash = Math.imul(hash, 16777619);
		}

		return `video_${(hash >>> 0).toString(16)}`;
	}

	/** @param {object} asset @param {string} sourceUrl @param {object|null} existing @param {number} projectDuration @returns {object} */
	static clip(asset, sourceUrl, existing, projectDuration) {
		const start = existing?.start || 0;
		const availableDuration = Math.max(100, projectDuration - start);
		const duration = Math.min(
			asset.durationMs || availableDuration,
			availableDuration
		);

		return {
			id: existing?.id || `video_clip_${asset.id}`,
			trackId: 'track_video',
			start,
			duration,
			type: 'video',
			name: asset.name,
			transform: existing?.transform || this.defaultTransform(),
			payload: {
				...existing?.payload,
				assetId: asset.id,
				sourceUrl,
				enabled: true,
				mimeType: asset.mimeType,
				width: asset.width,
				height: asset.height,
				blendMode: existing?.payload?.blendMode || 'normal',
				opacity: existing?.payload?.opacity ?? 1
			}
		};
	}

	static defaultTransform() {
		return {
			x: 0,
			y: 0,
			scale: 1,
			rotation: 0,
			opacity: 1,
			anchor: [0.5, 0.5]
		};
	}
}
