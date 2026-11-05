//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentNodes.js
 * @description Resolves the Chossid wardrobe and applies equipment visibility without revealing remote-pending materials.
 * The Awtsmoos clothes body and soul beyond exporter and node while Awtsmoos.com keeps visibility honest and bright;
 * a requested garment may become logically active at once, yet its mesh remains concealed until genuine image light.
 */

import { materialHasRealMap } from '../assets/RemoteMaterialImageValidity.js';
import { discoverMinimalMeadowGarments } from './MinimalMeadowGarmentDiscovery.js';

const BONE_ALIASES = Object.freeze({
	leftHand: ['mixamoriglefthand', 'lefthand', 'handl', 'wristl'],
	rightHand: ['mixamorigrighthand', 'righthand', 'handr', 'wristr'],
	spine: ['mixamorigspine2', 'mixamorigspine1', 'spine2', 'spine1', 'chest', 'upperback']
});

const REMOVABLE_VISUALS = Object.freeze([
	'glasses', 'jacket', 'outer-shirt', 'teffilin-arm', 'teffilin-head', 'top-hat', 'yarmulka'
]);

export function resolveMinimalEquipmentNodes(model) {
	const index = nodeIndex(model);
	const wardrobe = discoverMinimalMeadowGarments(model);
	return {
		garments: wardrobe.visuals,
		leftHand: resolve(index, BONE_ALIASES.leftHand),
		modelRoot: model || null,
		rightHand: resolve(index, BONE_ALIASES.rightHand),
		spine: resolve(index, BONE_ALIASES.spine),
		wardrobe
	};
}

export function applyMinimalGarmentVisibility(nodes, equipment) {
	const active = new Set();
	for (const itemId of Object.values(equipment || {})) {
		const visualId = visualForItem(itemId);
		if (visualId) {
			active.add(visualId);
		}
	}
	for (const visualId of REMOVABLE_VISUALS) {
		setVisual(nodes.wardrobe, visualId, active.has(visualId));
	}
	const armTefillin = active.has('tefillin-arm');
	setVisual(nodes.wardrobe, 'jacket', active.has('jacket') && !armTefillin);
	setVisual(nodes.wardrobe, 'jacket-tefillin', active.has('jacket') && armTefillin);
	for (const visualId of ['body-shirt', 'body-pants', 'body-shoes']) {
		setVisual(nodes.wardrobe, visualId, true);
	}
	return {
		active: [...active],
		discovered: nodes.wardrobe.diagnostics(),
		tefillinJacket: active.has('jacket') && armTefillin
	};
}

function visualForItem(itemId) {
	const map = {
		'base-shirt': 'body-shirt', 'black-coat': 'jacket', 'black-trousers': 'body-pants',
		'blue-scholar-glasses': 'glasses', 'brown-kapote': 'jacket', 'linen-outer-shirt': 'outer-shirt',
		'scholar-glasses': 'glasses', 'shabbos-top-hat': 'top-hat', 'tefillin-shel-rosh': 'tefillin-head',
		'tefillin-shel-yad': 'tefillin-arm', 'velvet-top-hat': 'top-hat', 'walking-boots': 'body-shoes',
		'white-outer-shirt': 'outer-shirt', 'wool-kippah': 'yarmulka'
	};
	return map[itemId] || null;
}

function setVisual(wardrobe, visualId, requestedVisible) {
	const record = wardrobe?.visuals?.get(visualId);
	for (const root of record?.roots || []) {
		root.visible = requestedVisible;
	}
	for (const mesh of record?.meshes || []) {
		const ready = meshMaterials(mesh).every(materialHasRealMap);
		mesh.visible = requestedVisible && ready;
		if (requestedVisible && !ready) {
			mesh.userData ||= {};
			mesh.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
		}
	}
}

function meshMaterials(mesh) {
	return Array.isArray(mesh?.material) ? mesh.material : [mesh?.material].filter(Boolean);
}

function nodeIndex(model) {
	const values = [];
	model?.traverse?.(node => values.push({ key: normalize(node.name), node }));
	return values;
}

function resolve(index, aliases) {
	for (const alias of aliases) {
		const entry = index.find(value => value.key === alias || value.key.includes(alias));
		if (entry) return entry.node;
	}
	return null;
}

function normalize(value) {
	return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
