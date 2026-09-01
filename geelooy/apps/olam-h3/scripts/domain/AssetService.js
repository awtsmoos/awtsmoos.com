//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES } from '../config/h3.js';
import { AssetValidation } from './AssetValidation.js';
import { MediaMetadata } from './MediaMetadata.js';

/**
 * Preserves reusable media as stable identities while the Awtsmoos lets one updated image flow instantly through every scene that points to it.
 * Awtsmoos.com validates before persistence, keeps user metadata during replacement, and translates local Blobs only at the provider boundary.
 */
export class AssetService {
	constructor(repositories, metadata = MediaMetadata) {
		this.repositories = repositories;
		this.metadata = metadata;
	}

	/** @param {File} file Local media. @param {string} category Category. @returns {Promise<Object>} Saved asset. */
	async addFile(file, category = 'Objects') {
		const prepared = await this.prepareFile(file);
		const existing = (await this.repositories.all('assets'))
			.find(item => item.signature === prepared.signature);
		if (existing) {
			return existing;
		}
		const now = Date.now();
		return this.repositories.put('assets', {
			id: crypto.randomUUID(),
			category,
			tags: [],
			favorite: false,
			createdAt: now,
			updatedAt: now,
			...prepared
		});
	}

	/** @param {string} id Existing asset ID. @param {File} file New media. @returns {Promise<Object>} Updated asset. */
	async replaceFile(id, file) {
		const current = await this.repositories.get('assets', id);
		if (!current) {
			throw new Error('That reusable asset no longer exists.');
		}
		const prepared = await this.prepareFile(file);
		if (prepared.kind !== current.kind) {
			throw new Error(`Replace this ${current.kind} with another ${current.kind} file.`);
		}
		return this.repositories.put('assets', {
			...current,
			...prepared,
			id: current.id,
			createdAt: current.createdAt,
			updatedAt: Date.now()
		});
	}

	/** @param {File} file Local media. @returns {Promise<Object>} Validated media fields. */
	async prepareFile(file) {
		const kind = AssetValidation.kindForMime(file.type);
		AssetValidation.file(file, kind);
		const metadata = await this.metadata.read(file, kind);
		AssetValidation.duration(kind, metadata.duration || 0);
		AssetValidation.metadata(kind, metadata);
		return {
			name: file.name,
			kind,
			mime: file.type,
			size: file.size,
			blob: file,
			sourceUrl: '',
			signature: [file.name, file.size, file.type, file.lastModified].join(':'),
			lastModified: file.lastModified,
			...metadata
		};
	}

	/** @param {string} sourceUrl URL. @param {string} kind Kind. @param {number} duration Duration. @returns {Promise<Object>} Asset. */
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
			id: crypto.randomUUID(), name: new URL(url).pathname.split('/').pop() || `${kind} reference`,
			kind, mime: '', size: 0, category: AssetValidation.categoryForKind(kind), tags: [], favorite: false,
			blob: null, sourceUrl: url, signature: `url:${url}`, createdAt: now, updatedAt: now,
			duration: Number(duration) || 0
		});
	}

	/** @param {Object} asset Asset. @param {string} role MiniMax role. @returns {Promise<Object>} Transport record. */
	async toTransport(asset, role) {
		if (asset.sourceUrl) {
			return { url: asset.sourceUrl, role, duration: asset.duration || 0 };
		}
		if (!asset.blob) {
			throw new Error(`${asset.name} has no reusable local file or public URL.`);
		}
		if (asset.blob.size > H3_CAPABILITIES.limits.inlineAssetBytes) {
			throw new Error(`${asset.name} is too large to inline safely. Add a public URL for this asset.`);
		}
		return { url: await this.metadata.dataUrl(asset.blob), role, duration: asset.duration || 0 };
	}
}
