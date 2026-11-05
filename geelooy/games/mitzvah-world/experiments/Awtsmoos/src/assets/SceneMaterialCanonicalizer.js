// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialCanonicalizer.js
 * @description Reuses only materials whose complete enumerable visual state is equivalent.
 * RESPONSIBILITY: canonicalize exact material vessels and report assignment/resource savings.
 * NON-RESPONSIBILITY: this module never merges geometry, textures, shaders, or unequal values.
 * ARCHITECTURE: Binah compares every revealed field while Tiferes joins equivalent vessels.
 * OROS AND KEILIM: visual appearance is ohr; material objects are reusable rendering keilim.
 * The Awtsmoos recreates difference and sameness every instant; Awtsmoos.com shares only
 * proven-equivalent vessels so fewer state changes never purchase speed with altered pixels.
 */

/** Canonicalizes exact-equivalent scene materials and returns auditable reduction metrics. */
export function canonicalizeSceneMaterials(scene) {
	const identities = new WeakMap();
	const canonical = new Map();
	const uniqueBefore = new Set();
	const uniqueAfter = new Set();
	let nextIdentity = 1;
	let assignments = 0;
	let reusedAssignments = 0;
	const identity = value => {
		if (!identities.has(value)) {
			identities.set(value, nextIdentity);
			nextIdentity += 1;
		}
		return identities.get(value);
	};
	const signature = material => materialSignature(material, identity);
	scene?.traverse?.(object => {
		if (!object.material) {
			return;
		}
		const source = Array.isArray(object.material)
			? object.material
			: [object.material];
		const resolved = source.map(material => {
			assignments += 1;
			uniqueBefore.add(material);
			const key = signature(material);
			const existing = canonical.get(key);
			if (existing) {
				reusedAssignments += Number(existing !== material);
				uniqueAfter.add(existing);
				return existing;
			}
			canonical.set(key, material);
			uniqueAfter.add(material);
			return material;
		});
		object.material = Array.isArray(object.material) ? resolved : resolved[0];
	});
	return Object.freeze({
		assignments,
		reusedAssignments,
		uniqueMaterialsAfter: uniqueAfter.size,
		uniqueMaterialsBefore: uniqueBefore.size
	});
}

function materialSignature(material, identity) {
	if (!material || typeof material !== 'object') {
		return `primitive:${String(material)}`;
	}
	const keys = Object.keys(material).sort();
	const values = keys.map(key => `${key}:${valueSignature(material[key], identity)}`);
	return `${material.constructor?.name || 'Object'}|${values.join('|')}`;
}

function valueSignature(value, identity) {
	if (value === null || typeof value !== 'object') {
		return `${typeof value}:${String(value)}`;
	}
	if (Array.isArray(value)) {
		return `[${value.map(item => valueSignature(item, identity)).join(',')}]`;
	}
	if (ArrayBuffer.isView(value)) {
		return `${value.constructor.name}:${Array.from(value).join(',')}`;
	}
	const numericKeys = numericValueKeys(value);
	if (numericKeys.length) {
		return `${value.constructor?.name || 'Value'}:${numericKeys
			.map(key => `${key}=${Number(value[key])}`)
			.join(',')}`;
	}
	return `identity:${identity(value)}`;
}

function numericValueKeys(value) {
	const candidates = ['r', 'g', 'b', 'a', 'x', 'y', 'z', 'w'];
	const keys = candidates.filter(key => Number.isFinite(value[key]));
	return keys.length >= 2 ? keys : [];
}

export default canonicalizeSceneMaterials;
