// B"H
import {
	CRITICAL_RUNTIME_MATERIALS,
	RUNTIME_MATERIALS
} from './RuntimeMaterialManifest.js';
import {
	loadPublicMaterialImage,
	serializableImageRecord
} from './PublicMaterialImageLoader.js';
import { isSceneMaterialUrl } from './SceneMaterialPriority.js';

export const SCENE_MATERIAL_HYDRATION_URL_LIMIT = 2;

const imageCache = new Map();
const urlRecords = new Map();
const loadingByUrl = new Map();
const roleRecords = new Map();

/** Returns a complete browser Image or null; aliases permit declared substitutions. */
export function cachedTextureImage(url) {
	const image = imageCache.get(url);
	return usableImage(image) ? image : null;
}

/** Preserves compatibility with primitive builders that attach cached images synchronously. */
export function attachCachedTexture(material, url) {
	const image = cachedTextureImage(url);
	if (!image) return material;
	const shouldBind = !usableImage(material.mapImage) || replaceableMapImage(material, material.mapImage);
	if (!shouldBind) return { ...material, textureUrl: url };
	const prepared = prepareMapImage(material, image);
	if (!prepared) return material;
	return {
		...material,
		mapImage: prepared,
		mapImageFallback: false,
		textureUrl: url
	};
}

/** Loads one URL exactly once at a time and records browser-verifiable dimensions and timing. */
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
	const promise = loadPublicMaterialImage(url, timeoutMs)
		.then(record => {
			urlRecords.set(url, serializableImageRecord(record));
			if (record.ok) imageCache.set(url, record.image);
			return record;
		})
		.finally(() => loadingByUrl.delete(url));
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

/** Loads only first-frame roles; remaining images wait until their material exists in the scene. */
export async function preloadPublicMaterialImages(options = {}) {
	const source = options.all ? RUNTIME_MATERIALS : CRITICAL_RUNTIME_MATERIALS;
	const materials = source.slice(0, options.limit ?? source.length);
	return loadRuntimeMaterialRoles(materials, options);
}

/**
 * Keeps the historic async doorway while deferring optional work to scene cadence.
 * Passing a root performs one bounded cadence immediately; without one it records that
 * hydration is waiting for real scene references instead of preloading the catalog.
 */
export async function progressivelyHydratePublicMaterials(options = {}) {
	const hydration = options.root
		? hydrateSceneMaterialImages(options.root, options)
		: emptySceneHydrationStats(options);
	return {
		requested: hydration.requested,
		loaded: hydration.readyUrls,
		failed: hydration.failedUrls,
		pending: hydration.pending,
		ok: hydration.failedUrls === 0,
		strategy: 'scene-referenced-max-two-new-urls-per-cadence',
		records: [],
		hydration
	};
}

/**
 * Binds arrived images and starts at most two distinct, scene-referenced URLs.
 * Base, mix, and ordered terrain layers share the same request budget so one cadence
 * cannot fan out into the entire public catalog. Procedural leaf maps remain visible
 * while their public replacement is pending, then swap live without rebuilding geometry.
 */
export function hydrateSceneMaterialImages(root, options = {}) {
	const stats = emptySceneHydrationStats(options);
	const referenced = new Set();
	const ready = new Set();
	const pending = new Set();
	root?.traverse?.(object => {
		const materials = Array.isArray(object.material)
			? object.material
			: object.material ? [object.material] : [];
		for (const material of materials) {
			stats.materials += 1;
			hydrateMaterialSlots(object, material, stats, referenced, ready, pending);
		}
	});
	stats.referencedUrls = referenced.size;
	stats.readyUrls = ready.size;
	for (const url of pending) {
		if (stats.requested >= stats.requestLimit) break;
		if (cachedTextureImage(url)) continue;
		if (loadingByUrl.has(url)) {
			stats.loadingUrls += 1;
			continue;
		}
		const previous = urlRecords.get(url);
		if (previous && !previous.ok && options.retryFailed !== true) {
			stats.failedUrls += 1;
			continue;
		}
		stats.requested += 1;
		stats.requestedUrls.push(url);
		loadPublicMaterialUrl(url, options.timeoutMs ?? 8000).catch(() => null);
	}
	return stats;
}

export function runtimeMaterialUrls() {
	return Object.freeze(RUNTIME_MATERIALS.map(material => material.primaryUrl));
}

export function publicMaterialCacheStats() {
	return {
		cachedAliases: imageCache.size,
		uniqueImages: new Set(imageCache.values()).size,
		loading: loadingByUrl.size,
		failedUrls: [...urlRecords.values()].filter(record => !record.ok),
		roles: [...roleRecords.values()],
		sceneHydrationUrlLimit: SCENE_MATERIAL_HYDRATION_URL_LIMIT
	};
}

function hydrateMaterialSlots(object, material, stats, referenced, ready, pending) {
	hydrateSlot({
		boundField: 'mapImagesBound',
		holder: material,
		imageKey: 'mapImage',
		kind: 'map',
		material,
		object,
		url: material.textureUrl
	}, stats, referenced, ready, pending);
	hydrateSlot({
		boundField: 'mixImagesBound',
		holder: material,
		imageKey: 'mixImage',
		kind: 'mix',
		material,
		object,
		url: material.mixTextureUrl
	}, stats, referenced, ready, pending);
	for (const layer of material.textureLayers || []) {
		hydrateSlot({
			boundField: 'layerImagesBound',
			holder: layer,
			imageKey: 'image',
			kind: 'layer',
			material,
			object,
			url: layer?.url
		}, stats, referenced, ready, pending);
	}
}

function hydrateSlot(slot, stats, referenced, ready, pending) {
	if (!isSceneMaterialUrl(slot.url)) return;
	referenced.add(slot.url);
	let current = slot.holder?.[slot.imageKey];
	const replaceable = slot.kind === 'map' && replaceableMapImage(slot.material, current);
	const cached = cachedTextureImage(slot.url);
	if (cached && (!usableImage(current) || replaceable)) {
		const prepared = slot.kind === 'map' ? prepareMapImage(slot.material, cached) : cached;
		if (prepared) {
			slot.holder[slot.imageKey] = prepared;
			current = prepared;
			stats[slot.boundField] += 1;
			if (slot.kind === 'map') markRealMapImage(slot.object, slot.material);
		} else if (slot.kind === 'map') {
			stats.mapTransformsPending += 1;
		}
	}
	if (usableImage(current) && !replaceableMapImage(slot.material, current)) {
		ready.add(slot.url);
		if (slot.object.userData && slot.kind === 'map') {
			slot.object.userData.AwtsmoosMaterialEnforcement = 'real-mapImage-bound-live';
		}
		return;
	}
	stats.pending += 1;
	pending.add(slot.url);
}

function prepareMapImage(material, image) {
	const transform = material?.texturePolicy?.hydrateMapImage;
	if (typeof transform !== 'function') return image;
	try {
		const prepared = transform(image);
		return usableImage(prepared) ? prepared : null;
	} catch {
		return null;
	}
}

function replaceableMapImage(material, image) {
	return material?.mapImageFallback === true
		|| material?.texturePolicy?.proceduralFallbackActive === true
		|| image?.dataset?.replaceableByPublicTexture === 'true';
}

function markRealMapImage(object, material) {
	material.mapImageFallback = false;
	if (material.texturePolicy && !Object.isFrozen(material.texturePolicy)) {
		material.texturePolicy.realMapImage = true;
		material.texturePolicy.proceduralFallbackActive = false;
	}
	const materialEvidence = material.userData?.AwtsmoosForestMaterial;
	if (materialEvidence && !Object.isFrozen(materialEvidence)) {
		materialEvidence.realMapImage = true;
		materialEvidence.proceduralFallback = false;
	}
	const objectEvidence = object.userData?.AwtsmoosForestLayer;
	if (objectEvidence && !Object.isFrozen(objectEvidence)) {
		objectEvidence.realMapImage = true;
		objectEvidence.proceduralFallback = false;
	}
}

function emptySceneHydrationStats(options = {}) {
	const requestedLimit = Number(options.requestLimit);
	const requestLimit = Number.isFinite(requestedLimit)
		? Math.max(0, Math.min(SCENE_MATERIAL_HYDRATION_URL_LIMIT, Math.floor(requestedLimit)))
		: SCENE_MATERIAL_HYDRATION_URL_LIMIT;
	return {
		materials: 0,
		mapImagesBound: 0,
		mixImagesBound: 0,
		layerImagesBound: 0,
		mapTransformsPending: 0,
		pending: 0,
		requested: 0,
		requestedUrls: [],
		requestLimit,
		referencedUrls: 0,
		readyUrls: 0,
		loadingUrls: 0,
		failedUrls: 0
	};
}

function usableImage(image) {
	return !!(
		image
		&& (image.naturalWidth || image.videoWidth || image.width)
		&& (image.naturalHeight || image.videoHeight || image.height)
		&& image.complete !== false
	);
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
	const loaded = records.filter(record => record.loaded).length;
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
	return {
		url,
		width: image.naturalWidth || image.width,
		height: image.naturalHeight || image.height,
		durationMs: 0,
		error: null
	};
}
