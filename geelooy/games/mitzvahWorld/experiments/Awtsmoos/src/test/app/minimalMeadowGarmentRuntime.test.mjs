// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowGarmentRuntime.test.mjs
 * @description Verifies GLB extras discovery, visibility groups, jacket swap, and appearance.
 * The Awtsmoos clothes one actor through many exporter vessels; Awtsmoos.com proves that
 * tefillin, required base garments, hue, and fabric alter actual isolated model records.
 */

import assert from 'node:assert/strict';
import { applyMinimalGarmentAppearance } from '../../app/MinimalMeadowGarmentAppearance.js';
import { applyMinimalGarmentVisibility, resolveMinimalEquipmentNodes } from '../../app/MinimalMeadowEquipmentNodes.js';

const jacket = garmentRoot('jacket', 'jacket');
const tefillinJacket = garmentRoot('jacket-teffilin', 'jacket-tefillin');
const glasses = garmentRoot('glasses', 'glasses-frame', ['glasses-glass']);
const topHat = garmentRoot('top-hat', 'hat');
const kippah = garmentRoot('yarmulka', 'yarmulka', [], true);
const headTefillin = garmentRoot('tefillin-head-box', 'batim');
const headStraps = garmentRoot('head-teffilin-straps', 'head-straps');
const armTefillin = garmentRoot('teffiln-arm-box', 'shel-yad');
const armStraps = garmentRoot('tefillin-arm-straps', 'arm-straps');
const outerShirt = garmentRoot('outer-shirt', 'shirt-outer');
const body = meshNode('body', ['shirt', 'pants', 'shoes']);
const rightHand = node('mixamorig:RightHand');
const leftHand = node('mixamorig:LeftHand');
const spine = node('mixamorig:Spine2');
const model = tree('test-chossid', [
	jacket, tefillinJacket, glasses, topHat, kippah, headTefillin,
	headStraps, armTefillin, armStraps, outerShirt, body,
	rightHand, leftHand, spine
]);
const nodes = resolveMinimalEquipmentNodes(model);
const equipment = {
	coat: 'black-coat',
	eyes: 'scholar-glasses',
	feet: 'walking-boots',
	hat: 'shabbos-top-hat',
	kippah: 'wool-kippah',
	outerShirt: 'white-outer-shirt',
	pants: 'black-trousers',
	shirt: 'base-shirt',
	tefillinArm: 'tefillin-shel-yad',
	tefillinHead: 'tefillin-shel-rosh'
};
const visibility = applyMinimalGarmentVisibility(nodes, equipment);
assert.equal(jacket.visible, false);
assert.equal(tefillinJacket.visible, true);
assert.equal(body.visible, true);
assert.ok(visibility.active.includes('tefillin-head'));
assert.ok(visibility.discovered['body-shoes'].materials.includes('shoes'));

const appearance = applyMinimalGarmentAppearance(nodes.wardrobe, equipment, {
	'black-coat': { colorId: 'blue', fabricId: 'wool' },
	'scholar-glasses': { colorId: 'gold', fabricId: 'plain' }
});
assert.equal(appearance.jacket.colorId, 'blue');
assert.equal(firstMaterial(jacket).userData.garmentColorId, 'blue');
assert.equal(firstMaterial(tefillinJacket).userData.garmentFabricId, 'wool');
assert.equal(glasses.children[0].material[1].userData?.garmentColorId, undefined);
assert.equal(nodes.rightHand, rightHand);
console.log('MINIMAL_MEADOW_GARMENT_RUNTIME_TEST_OK=1');

function firstMaterial(root) {
	const value = root.children[0].material;
	return Array.isArray(value) ? value[0] : value;
}

function garmentRoot(garment, materialName, extraMaterials = [], misspelled = false) {
	const root = node(garment);
	root.userData.gltfNode = {
		extras: { [misspelled ? 'garament' : 'garment']: garment }
	};
	root.children.push(meshNode(`${garment}-mesh`, [materialName, ...extraMaterials]));
	return root;
}

function meshNode(name, materials) {
	const value = node(name);
	value.isMesh = true;
	value.material = materials.map(materialName => ({
		color: [1, 1, 1, 1],
		name: materialName,
		userData: {}
	}));
	return value;
}

function node(name) {
	return tree(name, []);
}

function tree(name, children) {
	return {
		children,
		name,
		userData: {},
		visible: true,
		traverse(visitor) {
			visitor(this);
			for (const child of children) child.traverse(visitor);
		}
	};
}
