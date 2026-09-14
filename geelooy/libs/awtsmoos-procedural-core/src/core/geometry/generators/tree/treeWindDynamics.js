//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeWindDynamics.js
 * @description Builds and samples a renderer-neutral hierarchical wind rig from one canonical tree skeleton.
 * Branch, twig, and leaf motion are deterministic time-domain transforms; no THREE.js, shader, DOM, or frame-loop API enters the botanical authority.
 */

/** Returns a deterministic 0..1 phase seed from one stable semantic identifier. */
function phaseFromId(id) {
	let hash = 2166136261;
	for (const character of String(id || "")) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967295;
}

/** Returns bounded normalized wind input compatible with weather coupling or authored values. */
function normalizeWind(input = {}) {
	const rawDirection = input.direction || input.windDirection || [1, 0, 0];
	const length = Math.hypot(...rawDirection) || 1;
	return Object.freeze({
		direction: Object.freeze(rawDirection.map(value => Number(value || 0) / length)),
		speed: Math.max(0, Number(input.speedMetersPerSecond ?? input.strength ?? 0)),
		gust: Math.max(0, Number(input.gustMetersPerSecond ?? input.gust ?? 0)),
		turbulence: Math.max(0, Math.min(1, Number(input.turbulence ?? 0.2)))
	});
}

/** Creates immutable branch and leaf response records from permanent skeleton identity. */
export function createTreeWindRig(skeleton, options = {}) {
	const maximumLevel = Math.max(1, ...skeleton.branches.map(branch => branch.level));
	const stiffness = Math.max(0.05, Math.min(1, Number(options.stiffness ?? 0.68)));
	const branches = skeleton.branches.map(branch => {
		const radius = Math.max(0.0001, Number(branch.nodes?.[0]?.radius || 0.01));
		const hierarchy = Math.max(0.05, branch.level / maximumLevel);
		const twig = branch.role === "foliage-twig" ? 1.5 : 1;
		return Object.freeze({
			id: branch.id,
			parentId: branch.parentId,
			flexibility: Math.min(2, hierarchy * twig / (1 + radius * 2) * (1.1 - stiffness)),
			phase: phaseFromId(branch.id) * Math.PI * 2
		});
	});
	const leaves = skeleton.leaves.map(leaf => Object.freeze({
		id: leaf.id,
		branchId: leaf.branchId,
		flutter: Math.max(0.1, Math.min(2, Number(options.leafFlutter ?? 1.25))),
		phase: phaseFromId(leaf.id) * Math.PI * 2
	}));
	return Object.freeze({
		skeletonHash: skeleton.contentHash,
		branches: Object.freeze(branches),
		leaves: Object.freeze(leaves)
	});
}

/** Samples hierarchical branch bends and leaf flutter at a deterministic world time. */
export function sampleTreeWindRig(rig, timeSeconds = 0, windInput = {}) {
	const wind = normalizeWind(windInput);
	const time = Number(timeSeconds || 0);
	const speedFactor = Math.min(4, wind.speed / 10);
	const gustFactor = Math.min(2, wind.gust / 20);
	const branches = rig.branches.map(branch => {
		const low = Math.sin(time * 1.2 + branch.phase);
		const gust = Math.sin(time * 2.7 + branch.phase * 1.7) * wind.turbulence;
		const magnitude = branch.flexibility * (speedFactor * 0.7 + gustFactor * 0.3) * (low + gust) * 0.18;
		return Object.freeze({
			id: branch.id,
			parentId: branch.parentId,
			bend: Object.freeze(wind.direction.map(value => value * magnitude))
		});
	});
	const leaves = rig.leaves.map(leaf => {
		const flutter = Math.sin(time * (6 + wind.speed * 0.25) + leaf.phase)
			* leaf.flutter
			* (0.12 + wind.turbulence * 0.3)
			* Math.min(1.5, speedFactor + 0.1);
		return Object.freeze({ id: leaf.id, branchId: leaf.branchId, flutter });
	});
	return Object.freeze({
		skeletonHash: rig.skeletonHash,
		timeSeconds: time,
		branches: Object.freeze(branches),
		leaves: Object.freeze(leaves)
	});
}
