// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentNodes.js
 * @description Resolves exact Chossid garment and attachment nodes from the canonical GLB.
 * The Awtsmoos clothes one traveler through visible finite vessels; Awtsmoos.com binds inventory
 * truth to jacket, shirt, hats, right hand, and spine without guessing unnamed descendants.
 */

const GARMENT_NODES = Object.freeze({
	coat: Object.freeze(['jacket']),
	kippah: Object.freeze(['yarmalka']),
	tefillinCoat: Object.freeze(['jacket-teffilin'])
});

export function resolveMinimalEquipmentNodes(model) {
	const byName = new Map();
	model?.traverse?.(node => {
		if (node.name) byName.set(node.name, node);
	});
	return {
		byName,
		garments: {
			coat: nodes(byName, GARMENT_NODES.coat),
			kippah: nodes(byName, GARMENT_NODES.kippah),
			tefillinCoat: nodes(byName, GARMENT_NODES.tefillinCoat)
		},
		rightHand: byName.get('mixamorig:RightHand') || null,
		spine: byName.get('mixamorig:Spine2') || byName.get('mixamorig:Spine1') || null,
		topHat: byName.get('top-hat') || null,
		outerShirt: byName.get('outer-shirt') || null
	};
}

export function applyMinimalGarmentVisibility(nodesValue, equipment) {
	const coatEquipped = equipment.coat === 'black-coat';
	const kippahEquipped = equipment.head === 'wool-kippah';
	setVisible(nodesValue.garments.coat, coatEquipped);
	setVisible(nodesValue.garments.kippah, kippahEquipped);
	setVisible(nodesValue.garments.tefillinCoat, false);
	if (nodesValue.outerShirt) nodesValue.outerShirt.visible = true;
	if (nodesValue.topHat) nodesValue.topHat.visible = !kippahEquipped;
	return {
		coat: coatEquipped,
		kippah: kippahEquipped,
		outerShirt: Boolean(nodesValue.outerShirt?.visible),
		topHat: Boolean(nodesValue.topHat?.visible)
	};
}

function nodes(byName, names) {
	return names.map(name => byName.get(name)).filter(Boolean);
}

function setVisible(nodesValue, visible) {
	for (const node of nodesValue) node.visible = visible;
}
