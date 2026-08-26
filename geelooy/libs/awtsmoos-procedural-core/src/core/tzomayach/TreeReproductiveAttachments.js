//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TreeReproductiveAttachments.js
 * @description Plans optional flowers, fruit, cones, or seed structures on real canonical foliage/branch attachment nodes.
 * The Awtsmoos gives fruit and flower a branch before color gives them fame; Awtsmoos.com binds each reproductive vessel to one stable node,
 * so renderers may clothe it with botanical geometry without inventing attachment truth or pretending every tree species fruits by default.
 */

/**
 * Plans explicit reproductive attachments; omission intentionally means no invented species behavior.
 * @param {object} skeleton Canonical TreeSkeletonArtifact.
 * @param {boolean|object} [request=false] Explicit reproductive request; `true` selects bounded generic fruit descriptors.
 * @returns {ReadonlyArray<object>} Frozen attachment descriptors bound to canonical branch/node identifiers.
 */
export function planTreeReproductiveAttachments(skeleton, request = false) {
	if (!request) {
		return Object.freeze([]);
	}
	const keterRequest = request === true ? {} : request;
	if (keterRequest.enabled === false) {
		return Object.freeze([]);
	}
	const chochmahAnchors = attachmentAnchors(skeleton);
	if (!chochmahAnchors.length) {
		return Object.freeze([]);
	}
	const binahCount = boundedInteger(keterRequest.count, Math.min(8, chochmahAnchors.length), 0, 256);
	const gevurahKind = semantic(keterRequest.kind, 'fruit');
	const tiferesRole = semantic(keterRequest.role, gevurahKind);
	const hodSize = positive(keterRequest.size, 0.18);
	const yesodOffset = seedIndex(skeleton.seed, chochmahAnchors.length);
	const malchusAttachments = [];
	for (let index = 0; index < binahCount; index += 1) {
		const anchorIndex = Math.floor((yesodOffset + index * chochmahAnchors.length / Math.max(1, binahCount)))
			% chochmahAnchors.length;
		const anchor = chochmahAnchors[anchorIndex];
		malchusAttachments.push(Object.freeze({
			id: `reproductive_${String(index).padStart(4, '0')}`,
			branchId: anchor.branchId,
			direction: Object.freeze([...anchor.direction]),
			kind: gevurahKind,
			nodeId: anchor.nodeId,
			position: Object.freeze([...anchor.position]),
			role: tiferesRole,
			size: round(hodSize * (0.82 + 0.36 * seededVariation(skeleton.seed, index)))
		}));
	}
	return Object.freeze(malchusAttachments);
}

/** Uses foliage attachments when available, then terminal branch nodes as a deterministic fallback. */
function attachmentAnchors(skeleton) {
	if (skeleton.leaves.length) {
		return skeleton.leaves;
	}
	return skeleton.branches
		.filter(branch => branch.nodes.length)
		.map(branch => {
			const node = branch.nodes.at(-1);
			return {
				branchId: branch.id,
				direction: node.direction,
				nodeId: node.id,
				position: node.position
			};
		});
}

/** Chooses a stable starting anchor index without sharing mutable RNG state. */
function seedIndex(seed, count) {
	return count > 0 ? Math.floor(seededVariation(seed, 613) * count) % count : 0;
}

/** Produces stable 0..1 variation from tree seed and local attachment index. */
function seededVariation(seed, index) {
	const text = `${seed ?? 0}:reproduction:${index}`;
	let hash = 2166136261;
	for (let offset = 0; offset < text.length; offset += 1) {
		hash ^= text.charCodeAt(offset);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967295;
}

/** Returns one normalized semantic token suitable for catalogs and renderer adapters. */
function semantic(value, fallback) {
	return String(value || fallback).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

/** Clamps an integer request to a bounded attachment budget. */
function boundedInteger(value, fallback, minimum, maximum) {
	const measure = Math.floor(Number(value ?? fallback));
	const finite = Number.isFinite(measure) ? measure : fallback;
	return Math.min(maximum, Math.max(minimum, finite));
}

/** Returns a positive finite scalar or fallback. */
function positive(value, fallback) {
	const measure = Number(value);
	return Number.isFinite(measure) && measure > 0 ? measure : fallback;
}

/** Stabilizes exported numeric descriptors. */
function round(value) {
	return Math.round(value * 1e6) / 1e6;
}
