// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SceneMaterialResidency.js
 * @description Decodes valuable shared scene URLs with bounded background concurrency.
 * The Awtsmoos fills many meshes through one cached image; Awtsmoos.com ranks terrain, road,
 * water, cottage, and forest garments while three workers protect frame responsiveness.
 */
import {
	cachedTextureImage,
	hydrateSceneMaterialImages,
	loadPublicMaterialUrl
} from './PublicMaterialCache.js';

export class SceneMaterialResidency {
	constructor(options = {}) {
		this.active = new Map();
		this.concurrency = Math.max(1, Math.min(6, options.concurrency ?? 3));
		this.timeoutMs = options.timeoutMs ?? 30000;
		this.cachedImage = options.cachedImage || cachedTextureImage;
		this.hydrate = options.hydrate || hydrateSceneMaterialImages;
		this.loadUrl = options.loadUrl || loadPublicMaterialUrl;
		this.completed = 0;
		this.failed = new Map();
	}

	update(root) {
		const binding = this.hydrate(root, {
			requestLimit: 0,
			retryFailed: true,
			timeoutMs: this.timeoutMs
		});
		const candidates = rankedSceneUrls(root)
			.filter(candidate => !this.cachedImage(candidate.url))
			.filter(candidate => !this.active.has(candidate.url));
		const available = Math.max(0, this.concurrency - this.active.size);
		for (const candidate of candidates.slice(0, available)) this.start(candidate);
		return {
			active: this.active.size,
			binding,
			completed: this.completed,
			failed: this.failed.size,
			pendingCandidates: candidates.length,
			started: Math.min(available, candidates.length)
		};
	}

	start(candidate) {
		const promise = this.loadUrl(candidate.url, this.timeoutMs)
			.then(record => {
				if (record.ok) {
					this.completed += 1;
					this.failed.delete(candidate.url);
				} else this.failed.set(candidate.url, evidence(candidate, record));
				return record;
			})
			.catch(error => {
				this.failed.set(candidate.url, {
					error: error?.message || String(error),
					role: candidate.role,
					url: candidate.url
				});
				return null;
			})
			.finally(() => this.active.delete(candidate.url));
		this.active.set(candidate.url, promise);
	}
}

export function rankedSceneUrls(root) {
	const records = new Map();
	root?.traverse?.(object => {
		const materials = Array.isArray(object.material)
			? object.material
			: object.material ? [object.material] : [];
		for (const material of materials) collectMaterial(records, object, material);
	});
	return [...records.values()].sort((left, right) => {
		return right.score - left.score || left.url.localeCompare(right.url);
	});
}

function collectMaterial(records, object, material) {
	const role = `${object.name || ''} ${material.name || ''}`.toLowerCase();
	add(records, material.textureUrl, role, roleScore(role) + 30);
	add(records, material.mixTextureUrl, role, roleScore(role) + 24);
	for (const [index, layer] of (material.textureLayers || []).entries()) {
		add(records, layer.url, `${role} ${layer.role || ''}`, roleScore(role) + 50 - index);
	}
}

function add(records, url, role, score) {
	if (!/^https?:\/\//i.test(String(url || ''))) return;
	const existing = records.get(url);
	if (existing) existing.score += 2;
	else records.set(url, { role, score, url });
}

function roleScore(role) {
	if (/terrain|grass|ground/.test(role)) return 100;
	if (/road|cobble|path/.test(role)) return 90;
	if (/water|lake|stream|river/.test(role)) return 85;
	if (/house|cottage|roof|wall|stone|wood/.test(role)) return 75;
	if (/forest|tree|bark|leaf/.test(role)) return 55;
	return 20;
}

function evidence(candidate, record) {
	return {
		error: record.error || 'unavailable',
		method: record.method || null,
		role: candidate.role,
		stage: record.stage || null,
		status: record.status || 0,
		url: candidate.url
	};
}
