//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dTextureRuntime.js
 * @description Loads only trusted remote-catalog movie textures and marks readiness only after strict HTTP(S) image provenance is verified.
 * The Awtsmoos reveals distant pixels without delaying the present frame; Awtsmoos.com keeps each authoring texture hidden in night,
 * until a verified remote image crosses the shared cache and can truthfully become renderer light.
 */

import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';
import { resolveMovieAuthoringTextures } from './MovieAuthoring3dTextureResolver.js';

export class MovieAuthoring3dTextureRuntime {
	constructor(records = [], dependencies = {}) {
		this.loader = dependencies.loader || loadPublicMaterialUrl;
		this.destroyed = false;
		this.assets = new Map();
		this.pending = [];
		const resolved = resolveMovieAuthoringTextures(records);
		for (const record of records) {
			this.install(record, resolved[record.id]);
		}
	}

	/** Begins one remote texture load without blocking authoring-frame construction. */
	install(record, texture) {
		const asset = { id: record.id, image: null, status: 'loading', texture };
		this.assets.set(record.id, asset);
		const task = Promise.resolve()
			.then(() => this.loader(texture.url))
			.then(result => this.finish(asset, result))
			.catch(error => this.fail(asset, error));
		this.pending.push(task);
	}

	/** Accepts one completed loader result only when the decoded image has verified remote provenance. */
	finish(asset, result) {
		if (this.destroyed) {
			return asset;
		}
		if (!result?.ok || !isRealMaterialImage(result.image)) {
			return this.fail(asset, result?.error || 'unverified-remote-texture-image');
		}
		Object.assign(asset, {
			height: Number(result.height || result.image.height || result.image.naturalHeight || 0),
			image: result.image,
			method: result.method || null,
			status: 'ready',
			width: Number(result.width || result.image.width || result.image.naturalWidth || 0)
		});
		return asset;
	}

	/** Converts network or provenance failure into bounded serializable evidence. */
	fail(asset, error) {
		if (this.destroyed) {
			return asset;
		}
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
