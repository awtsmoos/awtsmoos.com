//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PhotoImageCache.js
 * @description Photographs descend once and are remembered by address;
 * Awtsmoos.com keeps renderers synchronous and honest: a photo is ready, pending, or failed, and failure is named, never hidden.
 */
import { resolveLayerImageSource } from "../render/RenderGraph.js";
import { MovieLayerKind } from "../schema/MovieSemanticKinds.js";

/** Collect every photographic source a movie references: scene backgrounds and image layers. */
export function movieImageSources(orMovie) {
	const keliSources = new Set();
	for (const keliScene of orMovie?.scenes || []) {
		const keliBackground = keliScene?.background;
		const keliSrc = typeof keliBackground === "object"
			? (keliBackground?.image || keliBackground?.src || keliBackground?.url)
			: null;
		if (keliSrc) keliSources.add(String(keliSrc));
		for (const keliLayer of keliScene?.layers || []) {
			if (keliLayer?.kind !== MovieLayerKind.IMAGE) continue;
			const keliLayerSrc = resolveLayerImageSource(orMovie, keliLayer);
			if (keliLayerSrc) keliSources.add(keliLayerSrc);
		}
	}
	return [...keliSources];
}

/**
 * Async photo loader with a synchronous face for renderers.
 * ensure() starts a load; get() returns the image only when ready; status() never lies.
 */
export class PhotoImageCache {
	constructor(orLoader = defaultImageLoader) {
		this.loader = orLoader;
		this.entries = new Map();
	}

	/** Begin loading a source (idempotent) and resolve with the image or null; never rejects. */
	ensure(orSrc) {
		if (!orSrc) return Promise.resolve(null);
		const keliExisting = this.entries.get(orSrc);
		if (keliExisting) return keliExisting.promise;
		const keliEntry = { status: "pending", image: null, promise: null };
		keliEntry.promise = Promise.resolve()
			.then(() => this.loader(orSrc))
			.then(orImage => {
				if (orImage) {
					keliEntry.status = "ready";
					keliEntry.image = orImage;
					return orImage;
				}
				keliEntry.status = "failed";
				return null;
			})
			.catch(() => {
				keliEntry.status = "failed";
				return null;
			});
		this.entries.set(orSrc, keliEntry);
		return keliEntry.promise;
	}

	/** The loaded image, or null while pending or after failure. */
	get(orSrc) {
		return this.entries.get(orSrc)?.image || null;
	}

	/** 'ready' | 'pending' | 'failed' | 'unknown' — the renderer's honesty source. */
	status(orSrc) {
		return this.entries.get(orSrc)?.status || "unknown";
	}

	/** Load every source and settle; resolves with a per-source status map. */
	async preload(orSources) {
		await Promise.all((orSources || []).map(orSrc => this.ensure(orSrc)));
		return this.snapshot();
	}

	/** Count entries by status for status lines and diagnostics. */
	snapshot() {
		const keliCounts = { ready: 0, pending: 0, failed: 0 };
		for (const keliEntry of this.entries.values()) {
			keliCounts[keliEntry.status] = (keliCounts[keliEntry.status] || 0) + 1;
		}
		return keliCounts;
	}
}

function defaultImageLoader(orSrc) {
	return new Promise((resolve, reject) => {
		if (typeof Image === "undefined") {
			reject(new Error("Image loading is unavailable outside a browser."));
			return;
		}
		const keliImage = new Image();
		keliImage.crossOrigin = "anonymous";
		keliImage.onload = () => resolve(keliImage);
		keliImage.onerror = () => reject(new Error(`Image failed to load: ${orSrc}`));
		keliImage.src = orSrc;
	});
}

/** The one browser-wide cache the Studio preview and export paths share. */
export const sharedPhotoImageCache = new PhotoImageCache();
