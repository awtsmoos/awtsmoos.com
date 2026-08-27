//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives shared matter its source while temporary accents belong only to the local finite vessel;
 * Awtsmoos.com isolates clone-and-accent behavior here so the later native-material migration can remove this compatibility shell clean and level.
 */

/** Apply an owned emissive accent without mutating shared photographic material assets. */
export function setCorePartGlow(root, color, intensity = 0.8) {
	visitMeshes(root, material => {
		material.emissive?.setHex(color);
		material.emissiveIntensity = intensity;
	});
	return root;
}

/** Apply an owned renderer-boundary tint from a renderer-neutral integer hex. */
export function setCorePartTint(root, color) {
	visitMeshes(root, material => {
		material.color?.setHex(color);
	});
	return root;
}

function visitMeshes(root, mutateMaterial) {
	root.traverse(child => {
		if (!child.isMesh) {
			return;
		}
		child.material = ownedClone(child.material);
		mutateMaterial(child.material);
	});
}

function ownedClone(material) {
	const clone = material.clone();
	clone.userData = {
		...material.userData,
		sharedAsset: false
	};
	return clone;
}
