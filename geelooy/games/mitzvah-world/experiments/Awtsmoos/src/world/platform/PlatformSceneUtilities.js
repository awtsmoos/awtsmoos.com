// B"H
// Boruch Hashem
// Blessed is He

/** @file PlatformSceneUtilities.js @description Shared placement and visible-mesh measurements. */
export function platformGroundPosition(runtime, x, z, lift = 0) {
	return {
		x,
		y: runtime.groundSampler.heightAt(x, z).y + lift,
		z
	};
}

export function countPlatformMeshes(root) {
	let count = 0;
	root.traverse(object => {
		if (object.isMesh) count += 1;
	});
	return count;
}
