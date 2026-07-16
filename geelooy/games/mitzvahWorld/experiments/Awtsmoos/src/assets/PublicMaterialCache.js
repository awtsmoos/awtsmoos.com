// B"H
import {
	CRITICAL_RUNTIME_MATERIALS,
	RUNTIME_MATERIALS
} from './RuntimeMaterialManifest.js';
import { WORLD_TEXTURE_MATERIALS } from './WorldTextureManifest.js';
import {
	loadPublicMaterialImage,
	serializableImageRecord
} from './PublicMaterialImageLoader.js';

const imageCache = new Map();
const urlRecords = new Map();
const loadingByUrl = new Map();
const roleRecords = new Map();

/** Returns a complete browser Image or null; aliases permit half-resolution substitutions. */
export function cachedTextureImage(url) {
	const image = imageCache.get(url);
	return image?.complete && image.naturalWidth > 0 ? image : null;
}

/** Preserves compatibility with primitive builders that attach cached images synchronously. */
export function attachCachedTexture(material, url) {
	const image = cachedTextureImage(url);
	return image ? { ...material, mapImage: material.mapImage || image, textureUrl: url } : material;
}

/** Loads one URL exactly once and records browser-verifiable dimensions and timing. */
export async function loadPublicMaterialUrl(url, timeoutMs = 8000) {
	const cached = cachedTextureImage(url);
	if (cached) {
		return {
			...(urlRecords.get(url) || imageEvidence(url, cached)),
			ok: true,
			image: cached,
			fromCache: true
		};
	}
	if (loadingByUrl.has(url)) return loadingByUrl.get(url);
	const promise = loadPublicMaterialImage(url, timeoutMs).then((record) => {
		loadingByUrl.delete(url);
		urlRecords.set(url, serializableImageRecord(record));
		if (record.ok) imageCache.set(url, record.image);
		return record;
	});
	loadingByUrl.set(url, promise);
	return promise;
}

/** Loads one semantic role, trying only declared and auditable fallbacks. */
export async function loadRuntimeMaterial(material, options = {}) {
	const candidates = [material.primaryUrl, ...material.fallbackUrls];
	const attempts = [];
	for (const candidate of candidates) {
		const result = await loadPublicMaterialUrl(candidate, options.timeoutMs);
		attempts.push(serializableImageRecord(result));
		if (!result.ok) continue;
		for (const alias of candidates) imageCache.set(alias, result.image);
		const record = roleEvidence(material, result, candidate, attempts);
		roleRecords.set(material.role, record);
		return record;
	}
	const failed = roleEvidence(material, null, null, attempts);
	roleRecords.set(material.role, failed);
	return failed;
}

/** Loads semantic roles with bounded concurrency and an optional settled callback. */
export async function loadRuntimeMaterialRoles(materials = RUNTIME_MATERIALS, options = {}) {
	const records = new Array(materials.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < materials.length) {
			const index = cursor++;
			const record = await loadRuntimeMaterial(materials[index], options);
			records[index] = record;
			options.onSettled?.(record, index);
		}
	};
	const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, materials.length || 1));
	await Promise.all(Array.from({ length: concurrency }, worker));
	return summarize(records);
}

/** Loads only first-frame roles; the remaining roles can hydrate after the world appears. */
export async function preloadPublicMaterialImages(options = {}) {
	const source = options.all ? RUNTIME_MATERIALS : CRITICAL_RUNTIME_MATERIALS;
	const materials = source.slice(0, options.limit ?? source.length);
	return loadRuntimeMaterialRoles(materials, options);
}

/** Starts noncritical hydration without making world startup wait for it. */
export function progressivelyHydratePublicMaterials(options = {}) {
	const optional = [
		...RUNTIME_MATERIALS.filter((material) => !material.critical),
		...WORLD_TEXTURE_MATERIALS
	];
	return loadRuntimeMaterialRoles(optional, { concurrency: 2, timeoutMs: 9000, ...options });
}

/** Rebinds images downloaded after scene construction onto their existing material vessels. */
export function hydrateSceneMaterialImages(root) {
	const stats = { materials: 0, mapImagesBound: 0, mixImagesBound: 0, pending: 0 };
	root?.traverse?.((object) => {
		const material = object.material;
		if (!material) return;
		stats.materials += 1;
		if (!material.mapImage && material.textureUrl) {
			material.mapImage = cachedTextureImage(material.textureUrl);
			if (material.mapImage) stats.mapImagesBound += 1;
		}
		if (!material.mixImage && material.mixTextureUrl) {
			material.mixImage = cachedTextureImage(material.mixTextureUrl);
			if (material.mixImage) stats.mixImagesBound += 1;
		}
		if (material.textureUrl && !material.mapImage) stats.pending += 1;
		if (object.userData && material.mapImage) {
			object.userData.AwtsmoosMaterialEnforcement = 'real-mapImage-bound-live';
		}
	});
	return stats;
}

export function runtimeMaterialUrls() {
	return Object.freeze(RUNTIME_MATERIALS.map((material) => material.primaryUrl));
}

export function publicMaterialCacheStats() {
	return {
		cachedAliases: imageCache.size,
		uniqueImages: new Set(imageCache.values()).size,
		loading: loadingByUrl.size,
		failedUrls: [...urlRecords.values()].filter((record) => !record.ok),
		roles: [...roleRecords.values()]
	};
}

function roleEvidence(material, result, selectedUrl, attempts) {
	return {
		role: material.role,
		label: material.label,
		primaryUrl: material.primaryUrl,
		selectedUrl,
		usedFallback: !!selectedUrl && selectedUrl !== material.primaryUrl,
		loaded: !!result?.ok,
		cacheBound: !!selectedUrl && !!cachedTextureImage(selectedUrl),
		width: result?.width || 0,
		height: result?.height || 0,
		durationMs: attempts.reduce((total, attempt) => total + attempt.durationMs, 0),
		error: result?.ok ? null : attempts.at(-1)?.error || 'no-candidate-loaded',
		attempts
	};
}

function summarize(records) {
	const loaded = records.filter((record) => record.loaded).length;
	return {
		requested: records.length,
		loaded,
		failed: records.length - loaded,
		pending: 0,
		ok: loaded === records.length,
		strategy: 'role-manifest-bounded-concurrency-shared-image-cache',
		records
	};
}

function imageEvidence(url, image) {
	return { url, width: image.naturalWidth, height: image.naturalHeight, durationMs: 0, error: null };
}
