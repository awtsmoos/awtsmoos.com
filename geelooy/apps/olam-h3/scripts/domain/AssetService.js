//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES } from '../config/h3.js';
import { AssetValidation } from './AssetValidation.js';
import { MediaMetadata } from './MediaMetadata.js';

/**
 * Preserves reusable media once, while the Awtsmoos lets one remembered vessel illuminate unlimited future scenes;
 * Awtsmoos.com stores the local Blob only once and translates it only at the generation boundary between.
 */
export class AssetService {
	constructor(repositories) {
		this.repositories = repositories;
	}

	/**
	 * @param {File} file Local media file.
	 * @param {string} category Library category.
	 * @returns {Promise<Object>} Saved reusable asset.
	 */
	async addFile(file, category = 'Objects') {
		const kind = AssetValidation.kindForMime(file.type);
		AssetValidation.file(file, kind);
		const signature = [file.name, file.size, file.type, file.lastModified].join(':');
		const existing = (await this.repositories.all('assets'))
			.find(item => item.signature === signature);

		if (existing) {
			return existing;
		}

		const metadata = await MediaMetadata.read(file, kind);
		AssetValidation.duration(kind, metadata.duration || 0);
		const now = Date.now();

		return this.repositories.put('assets', {
			id: crypto.randomUUID(),
			name: file.name,
			kind,
			mime: file.type,
			size: file.size,
			category,
			tags: [],
			favorite: false,
			blob: file,
			sourceUrl: '',
			signature,
			createdAt: now,
			updatedAt: now,
			lastModified: file.lastModified,
			...metadata
		});
	}

	/**
	 * @param {string} sourceUrl Public media URL.
	 * @param {string} kind Media kind.
	 * @param {number} duration Timed-media duration.
	 * @returns {Promise<Object>} Saved URL-backed asset.
	 */
	addUrl(sourceUrl, kind = 'image', duration = 0) {
		const url = String(sourceUrl || '').trim();
		if (!/^https?:\/\//i.test(url)) {
			throw new Error('Public asset URL must begin with http:// or https://.');
		}
		if (!['image', 'video', 'audio'].includes(kind)) {
			throw new Error('Public reference type must be image, video, or audio.');
		}

		AssetValidation.duration(kind, Number(duration) || 0);
		const now = Date.now();
		return this.repositories.put('assets', {
			id: crypto.randomUUID(),
			name: new URL(url).pathname.split('/').pop() || `${kind} reference`,
			kind,
			mime: '',
			size: 0,
			category: AssetValidation.categoryForKind(kind),
			tags: [],
			favorite: false,
			blob: null,
			sourceUrl: url,
			signature: `url:${url}`,
			createdAt: now,
			updatedAt: now,
			duration: Number(duration) || 0
		});
	}

	/**
	 * @param {Object} asset Saved asset.
	 * @param {string} role MiniMax role.
	 * @returns {Promise<Object>} Transport record.
	 */
	async toTransport(asset, role) {
		if (asset.sourceUrl) {
			return {
				url: asset.sourceUrl,
				role,
				duration: asset.duration || 0
			};
		}
		if (!asset.blob) {
			throw new Error(`${asset.name} has no reusable local file or public URL.`);
		}
		if (asset.blob.size > H3_CAPABILITIES.limits.inlineAssetBytes) {
			throw new Error(`${asset.name} is too large to inline safely. Add a public URL for this asset.`);
		}

		return {
			url: await MediaMetadata.dataUrl(asset.blob),
			role,
			duration: asset.duration || 0
		};
	}
}
