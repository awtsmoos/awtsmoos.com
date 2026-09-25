// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahStudioHandoff.js
 * @description Applies a mitzvah-studio world handoff into the live game. The studio
 * writes localStorage key `awtsmoos.mitzvahStudio.handoff.v1` (a normalized
 * `awtsmoos.world.v1` document) and navigates to `/games/mitzvahWorld/?studioHandoff=1`;
 * this module reads that document exactly once, validates it, converts each object to a
 * creator placement definition, and mounts every convertible object through the real
 * `MitzvahWorldCreatorRuntimeAdapter` placement API (the same scene + exact-reference
 * octree the creator itself uses). The storage key is removed after a successful
 * apply so reloads never duplicate the world. Never throws.
 */

import { WORLD_FORMAT } from '../../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/constants.js';
import { mitzvahWorldCreatorPart } from '../creator/MitzvahWorldCreatorCatalog.js';
import { MitzvahWorldCreatorRuntimeAdapter } from '../creator/MitzvahWorldCreatorRuntimeAdapter.js';

const HANDOFF_STORAGE_KEY = 'awtsmoos.mitzvahStudio.handoff.v1';
const HANDOFF_FLAG_PATTERN = /[?&]studioHandoff=1(?![0-9])/;
const MAXIMUM_COORDINATE = 1000000;
const MAXIMUM_DIMENSION = 1024;
/**
 * Studio shapes the game geometry factory materializes directly.
 * Any other studio shape mounts as a box rather than being skipped.
 */
const HANDOFF_SHAPES = Object.freeze(['box', 'cylinder', 'sphere']);

function safeStorage(environment) {
	try {
		const storage = environment?.localStorage;
		if (storage && typeof storage.getItem === 'function' && typeof storage.removeItem === 'function') {
			return storage;
		}
	} catch { /* storage access can throw in hardened contexts */ }
	return null;
}

function safeRemove(storage) {
	try {
		storage.removeItem(HANDOFF_STORAGE_KEY);
	} catch { /* removal is best-effort */ }
}

function slug(text) {
	return String(text || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48) || 'part';
}

function readAxis(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) throw new Error('handoff-vector-invalid');
	return number;
}

function readPoint(point) {
	if (!point || typeof point !== 'object') throw new Error('handoff-position-invalid');
	const x = readAxis(point.x);
	const y = readAxis(point.y);
	const z = readAxis(point.z);
	for (const value of [x, y, z]) {
		if (Math.abs(value) > MAXIMUM_COORDINATE) throw new Error('handoff-coordinate-out-of-range');
	}
	return { x, y, z };
}

function readSize(object, catalogPart) {
	const fallback = catalogPart?.size ? { ...catalogPart.size } : { x: 1, y: 1, z: 1 };
	const size = object?.size;
	if (size && typeof size === 'object') {
		const candidate = {
			x: readAxis(size.x),
			y: readAxis(size.y),
			z: readAxis(size.z)
		};
		for (const value of [candidate.x, candidate.y, candidate.z]) {
			if (value <= 0 || value > MAXIMUM_DIMENSION) throw new Error('handoff-size-out-of-range');
		}
		return candidate;
	}
	if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
		const scaled = {
			x: fallback.x * size,
			y: fallback.y * size,
			z: fallback.z * size
		};
		for (const value of [scaled.x, scaled.y, scaled.z]) {
			if (value <= 0 || value > MAXIMUM_DIMENSION) throw new Error('handoff-size-out-of-range');
		}
		return scaled;
	}
	return fallback;
}

function readRotation(rotation) {
	const axis = value => {
		const number = Number(value);
		return Number.isFinite(number) ? number : 0;
	};
	if (typeof rotation === 'number' && Number.isFinite(rotation)) {
		return { x: 0, y: rotation, z: 0 };
	}
	if (rotation && typeof rotation === 'object') {
		return { x: axis(rotation.x), y: axis(rotation.y), z: axis(rotation.z) };
	}
	return { x: 0, y: 0, z: 0 };
}

/** Converts one studio handoff object into a creator placement definition. */
function convertHandoffObject(object, index) {
	const catalogId = String(object?.catalogId || '').trim();
	if (!catalogId) throw new Error('handoff-catalog-missing');
	let catalogPart = null;
	try {
		catalogPart = mitzvahWorldCreatorPart(catalogId);
	} catch {
		// Generated studio geometry (gen-*) has no creator catalog entry; it mounts
		// as a generic procedural primitive carried by its own record.
		catalogPart = null;
	}
	const shape = HANDOFF_SHAPES.includes(object?.shape) ? object.shape : 'box';
	const position = readPoint(object?.position);
	const size = readSize(object, catalogPart);
	const color = typeof object?.color === 'string' && object.color.trim()
		? object.color.trim()
		: (catalogPart?.color || '#d7c690');
	const label = typeof object?.label === 'string' && object.label.trim()
		? object.label
		: (catalogPart?.label || catalogId);
	return {
		id: `studio-handoff-${index}-${slug(object?.id || catalogId)}`,
		catalogId,
		color,
		label,
		position,
		rotation: readRotation(object?.rotation),
		shape,
		size
	};
}

function validateHandoffDocument(document) {
	if (!document || typeof document !== 'object' || Array.isArray(document)) {
		return { ok: false, reason: 'handoff-document-invalid' };
	}
	if (document.format !== WORLD_FORMAT) {
		return { ok: false, reason: `handoff-format-unsupported:${document.format || 'missing'}` };
	}
	if (!Array.isArray(document.objects)) {
		return { ok: false, reason: 'handoff-objects-invalid' };
	}
	return {
		ok: true,
		name: typeof document.name === 'string' ? document.name : null,
		objects: document.objects
	};
}

/**
 * Applies the studio handoff exactly once when `?studioHandoff=1` is present.
 * @param {object} [gameContext={}] Carries `runtime`; optional `environment`, `search`.
 * @returns {Readonly<object>} {applied, count, name, skipped, reason?, error?} — never throws.
 */
export function maybeApplyStudioHandoff(gameContext = {}) {
	const receipt = (fields = {}) => Object.freeze({
		applied: false,
		count: 0,
		name: null,
		skipped: 0,
		...fields
	});
	try {
		const environment = gameContext.environment || globalThis;
		const search = String(gameContext.search ?? environment?.location?.search ?? '');
		if (!HANDOFF_FLAG_PATTERN.test(search)) {
			return receipt({ reason: 'no-handoff-flag' });
		}
		const storage = safeStorage(environment);
		if (!storage) return receipt({ reason: 'no-storage' });
		const raw = storage.getItem(HANDOFF_STORAGE_KEY);
		if (!raw) return receipt({ reason: 'no-handoff-document' });
		let document = null;
		try {
			document = JSON.parse(raw);
		} catch {
			return receipt({ reason: 'handoff-json-invalid' });
		}
		const validation = validateHandoffDocument(document);
		if (!validation.ok) return receipt({ reason: validation.reason });
		const runtime = gameContext.runtime || null;
		if (!runtime?.scene?.add || !runtime?.mainOctree?.insert || !runtime?.mainOctree?.remove) {
			return receipt({ name: validation.name, reason: 'runtime-not-ready' });
		}
		const definitions = [];
		let skipped = 0;
		validation.objects.forEach((object, index) => {
			try {
				definitions.push(convertHandoffObject(object, index));
			} catch {
				skipped += 1;
			}
		});
		if (definitions.length === 0) {
			safeRemove(storage);
			return receipt({ name: validation.name, reason: 'no-convertible-objects', skipped });
		}
		const adapter = new MitzvahWorldCreatorRuntimeAdapter(runtime);
		let mounted = 0;
		for (const definition of definitions) {
			try {
				adapter.mount(definition);
				mounted += 1;
			} catch {
				skipped += 1;
			}
		}
		safeRemove(storage);
		if (runtime) {
			runtime.mitzvahStudioHandoffAdapter = adapter;
		}
		return receipt({
			applied: mounted > 0,
			count: mounted,
			name: validation.name,
			skipped,
			...(mounted === 0 ? { reason: 'no-objects-mounted' } : {})
		});
	} catch (error) {
		return receipt({ error: String(error?.message || error) });
	}
}

export default maybeApplyStudioHandoff;
