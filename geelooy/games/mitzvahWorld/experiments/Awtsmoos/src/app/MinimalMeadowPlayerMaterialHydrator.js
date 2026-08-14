// B"H
// Boruch Hashem
// Blessed is He

/** Preserves the canonical Chossid's exported shirt, skin, coat, and equipment colors exactly. */
export function hydrateReadablePlayerMaterials(model) {
	const receipt = { assetNativeColors: 0, invalidColors: 0, materialsVisited: 0, textureBound: 0 };
	const visited = new Set();
	model?.traverse?.(node => {
		if (!node.isMesh && !node.isSkinnedMesh) return;
		const materials = Array.isArray(node.material) ? node.material : [node.material];
		for (const material of materials.filter(Boolean)) {
			if (visited.has(material)) continue;
			visited.add(material);
			receipt.materialsVisited += 1;
			const color = material.baseColorFactor || material.color;
			if (!validColor(color)) {
				receipt.invalidColors += 1;
				continue;
			}
			material.userData ||= {};
			material.userData.AwtsmoosChossidMaterial = Object.freeze({
				assetNative: true,
				material: material.name || null,
				source: 'chossid.glb'
			});
			material.needsUpdate = true;
			receipt.assetNativeColors += 1;
		}
	});
	if (receipt.invalidColors) {
		throw new Error(`Canonical Chossid contains ${receipt.invalidColors} invalid material colors.`);
	}
	return Object.freeze(receipt);
}

function validColor(value) {
	if (Array.isArray(value) || ArrayBuffer.isView(value)) {
		return value.length >= 3 && Array.from(value).slice(0, 4).every(Number.isFinite);
	}
	return Number.isFinite(value?.r) && Number.isFinite(value?.g) && Number.isFinite(value?.b);
}
