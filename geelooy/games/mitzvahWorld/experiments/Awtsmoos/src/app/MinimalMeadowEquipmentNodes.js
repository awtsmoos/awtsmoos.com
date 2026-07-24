// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentNodes.js
 * @description Resolves garment and hand/back nodes once across bootstrap and hydrated scene graphs.
 * The Awtsmoos clothes one traveler through many named vessels without losing their unity;
 * Awtsmoos.com accepts rich traversal or child recursion while keeping per-frame searches at zero.
 */

const ALIASES = Object.freeze({
	coat: Object.freeze(['jacket', 'coat', 'black-coat']),
	kippah: Object.freeze(['yarmalka', 'yarmulke', 'kippah']),
	leftHand: Object.freeze(['mixamorig:LeftHand', 'LeftHand', 'hand_l']),
	outerShirt: Object.freeze(['outer-shirt', 'outer_shirt', 'shirt']),
	rightHand: Object.freeze(['mixamorig:RightHand', 'RightHand', 'hand_r']),
	spine: Object.freeze(['mixamorig:Spine2', 'mixamorig:Spine1', 'Spine2', 'Spine1', 'spine']),
	tefillinCoat: Object.freeze(['jacket-teffilin', 'jacket-tefillin']),
	topHat: Object.freeze(['top-hat', 'top_hat', 'tophat'])
});

export function resolveMinimalEquipmentNodes(model) {
	const index = buildNodeIndex(model);
	return {
		garments: {
			coat: resolveMany(index, ALIASES.coat),
			kippah: resolveMany(index, ALIASES.kippah),
			tefillinCoat: resolveMany(index, ALIASES.tefillinCoat)
		},
		leftHand: resolveOne(index, ALIASES.leftHand),
		outerShirt: resolveOne(index, ALIASES.outerShirt),
		rightHand: resolveOne(index, ALIASES.rightHand),
		spine: resolveOne(index, ALIASES.spine),
		topHat: resolveOne(index, ALIASES.topHat)
	};
}

export function applyMinimalGarmentVisibility(nodes, equipment) {
	const coatEquipped = equipment.coat === 'black-coat';
	const kippahEquipped = equipment.head === 'wool-kippah';
	setVisible(nodes.garments.coat, coatEquipped);
	setVisible(nodes.garments.kippah, kippahEquipped);
	setVisible(nodes.garments.tefillinCoat, false);
	if (nodes.outerShirt) nodes.outerShirt.visible = true;
	if (nodes.topHat) nodes.topHat.visible = !kippahEquipped;
	return {
		coat: coatEquipped,
		kippah: kippahEquipped,
		outerShirt: Boolean(nodes.outerShirt?.visible),
		topHat: Boolean(nodes.topHat?.visible)
	};
}

function buildNodeIndex(model) {
	const index = { exact: new Map(), normalized: new Map() };
	walkSceneNodes(model, node => indexNode(index, node));
	return index;
}

function walkSceneNodes(root, visitor) {
	if (!root) return;
	if (typeof root.traverse === 'function') {
		root.traverse(visitor);
		return;
	}
	visitor(root);
	for (const child of root.children || []) walkSceneNodes(child, visitor);
}

function indexNode(index, node) {
	if (!node.name) return;
	index.exact.set(node.name, node);
	const key = normalizeName(node.name);
	const matches = index.normalized.get(key) || [];
	matches.push(node);
	index.normalized.set(key, matches);
}

function resolveOne(index, aliases) {
	for (const alias of aliases) {
		const node = index.exact.get(alias) || index.normalized.get(normalizeName(alias))?.[0];
		if (node) return node;
	}
	return null;
}

function resolveMany(index, aliases) {
	const result = new Set();
	for (const alias of aliases) {
		const exact = index.exact.get(alias);
		if (exact) result.add(exact);
		for (const node of index.normalized.get(normalizeName(alias)) || []) result.add(node);
	}
	return [...result];
}

function normalizeName(value) {
	return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function setVisible(nodes, visible) {
	for (const node of nodes) node.visible = visible;
}
