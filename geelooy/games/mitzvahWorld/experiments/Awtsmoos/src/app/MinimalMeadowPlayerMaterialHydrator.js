// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerMaterialHydrator.js
 * @description Lifts only zero-black player materials into readable semantic garments and skin.
 * The Awtsmoos hides no face inside accidental void; Awtsmoos.com gives coat, hat, hands,
 * equipment, and body finite daylight color while every already-readable GLB material remains king.
 */

let sharedClothCanvas = null;

export function hydrateReadablePlayerMaterials(model, documentValue = globalThis.document) {
	const receipt = { materialsLifted: 0, materialsVisited: 0, textureBound: 0 };
	model?.traverse?.(node => {
		if (!node.isMesh && !node.isSkinnedMesh) {
			return;
		}
		const materials = Array.isArray(node.material) ? node.material : [node.material];
		for (const material of materials.filter(Boolean)) {
			receipt.materialsVisited += 1;
			if (!isZeroBlack(material)) {
				continue;
			}
			const color = semanticColor(node.name, material.name);
			material.color = [...color];
			material.baseColorFactor = [...color];
			material.roughness = material.roughness ?? 0.74;
			material.roughnessFactor = material.roughnessFactor ?? 0.74;
			material.metalness = material.metalness ?? 0.03;
			material.metallicFactor = material.metallicFactor ?? 0.03;
			material.emissiveColor = color.slice(0, 3).map(channel => channel * 0.08);
			material.emissiveStrength = material.emissiveStrength ?? 0.12;
			if (!material.mapImage && !isSkinRole(node.name, material.name)) {
				const canvas = clothCanvas(documentValue);
				if (canvas) {
					material.mapImage = canvas;
					material.mapRepeat = material.mapRepeat || [2, 3];
					material.anisotropy = material.anisotropy ?? 4;
					receipt.textureBound += 1;
				}
			}
			material.texturePolicy = {
				...(material.texturePolicy || {}),
				mobileReadablePlayer: true,
				semanticFallback: true
			};
			receipt.materialsLifted += 1;
		}
	});
	return receipt;
}

function isZeroBlack(material) {
	const color = Array.from(material.color || material.baseColorFactor || []);
	return color.length >= 3 && color.slice(0, 3).every(channel => Number(channel) <= 0.025);
}

function semanticColor(nodeName, materialName) {
	const name = `${nodeName || ''} ${materialName || ''}`.toLowerCase();
	if (/face|skin|hand|head/.test(name)) return [0.78, 0.57, 0.39, 1];
	if (/shirt|tzitzit|tallis/.test(name)) return [0.86, 0.83, 0.76, 1];
	if (/blade|sword|metal|buckle/.test(name)) return [0.48, 0.56, 0.66, 1];
	if (/staff|wood|handle/.test(name)) return [0.36, 0.2, 0.08, 1];
	if (/hair|beard/.test(name)) return [0.22, 0.1, 0.045, 1];
	if (/hat|coat|jacket|pants|body/.test(name)) return [0.16, 0.18, 0.22, 1];
	return [0.3, 0.32, 0.36, 1];
}

function isSkinRole(nodeName, materialName) {
	return /face|skin|hand|head/.test(`${nodeName || ''} ${materialName || ''}`.toLowerCase());
}

function clothCanvas(documentValue) {
	if (sharedClothCanvas || !documentValue?.createElement) {
		return sharedClothCanvas;
	}
	const canvas = documentValue.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	canvas.dataset ||= {};
	canvas.dataset.url = 'procedural://awtsmoos-player-cloth/readable-weave';
	const context = canvas.getContext?.('2d');
	if (!context) {
		return null;
	}
	context.fillStyle = '#a5abb5';
	context.fillRect(0, 0, 64, 64);
	context.strokeStyle = 'rgba(35,42,52,.28)';
	context.lineWidth = 1;
	for (let offset = 0; offset < 64; offset += 4) {
		context.beginPath();
		context.moveTo(offset, 0);
		context.lineTo(offset, 64);
		context.stroke();
	}
	sharedClothCanvas = canvas;
	return canvas;
}
