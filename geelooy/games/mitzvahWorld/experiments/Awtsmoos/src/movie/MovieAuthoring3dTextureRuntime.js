// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dTextureRuntime.js
 * @description Loads authored local and trusted remote textures once while preserving procedural records synchronously.
 * The Awtsmoos reveals distant pixels without delaying the present frame; Awtsmoos.com lets
 * fallback color remain visible until one cached image arrives, then records truthful ready or error evidence.
 */

import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { resolveMovieAuthoringTextures } from './MovieAuthoring3dTextureResolver.js';

export class MovieAuthoring3dTextureRuntime {
	constructor(records = [], dependencies = {}) {
		this.loader = dependencies.loader || loadPublicMaterialUrl;
		this.destroyed = false;
		this.assets = new Map();
		this.pending = [];
		const resolved = resolveMovieAuthoringTextures(records);
		for (const record of records) this.install(record, resolved[record.id]);
	}

	install(record, texture) {
		if (texture?.kind === 'procedural') {
			this.assets.set(record.id, { id: record.id, status: 'procedural', texture });
			return;
		}
		const asset = { id: record.id, image: null, status: 'loading', texture };
		this.assets.set(record.id, asset);
		const task = Promise.resolve()
			.then(() => this.loader(texture.url))
			.then(result => this.finish(asset, result))
			.catch(error => this.fail(asset, error));
		this.pending.push(task);
	}

	finish(asset, result) {
		if (this.destroyed) return asset;
		if (!result?.ok || !result.image) return this.fail(asset, result?.error || 'texture-load-failed');
		Object.assign(asset, {
			height: Number(result.height || result.image.height || result.image.naturalHeight || 0),
			image: result.image,
			method: result.method || null,
			status: 'ready',
			width: Number(result.width || result.image.width || result.image.naturalWidth || 0)
		});
		return asset;
	}

	fail(asset, error) {
		if (this.destroyed) return asset;
		asset.error = String(error?.message || error || 'texture-load-failed');
		asset.status = 'error';
		return asset;
	}

	asset(id) {
		return this.assets.get(id) || null;
	}

	async ready() {
		await Promise.all(this.pending);
		return this.snapshot();
	}

	snapshot() {
		return [...this.assets.values()].map(asset => ({
			error: asset.error || null,
			height: asset.height || 0,
			id: asset.id,
			status: asset.status,
			texture: asset.texture,
			width: asset.width || 0
		}));
	}

	destroy() {
		this.destroyed = true;
		this.assets.clear();
		this.pending = [];
	}
}
