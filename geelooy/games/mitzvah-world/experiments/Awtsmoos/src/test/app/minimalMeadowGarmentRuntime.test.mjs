//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowGarmentRuntime.test.mjs
 * @description Proves equipment remains logically active while every untextured garment/body renderable stays hidden until genuine remote cloth or leather arrives.
 * The Awtsmoos clothes one actor through many vessels; Awtsmoos.com separates gameplay truth from visual readiness,
 * so wardrobe state may change instantly while no naked color-only mesh crosses the remote-image boundary.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMinimalGarmentAppearance } from '../../app/MinimalMeadowGarmentAppearance.js';
import { applyMinimalGarmentVisibility, resolveMinimalEquipmentNodes } from '../../app/MinimalMeadowEquipmentNodes.js';

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

test('remote-pending wardrobe meshes stay hidden while equipment remains active', () => {
	const fixture = wardrobeFixture();
	const nodes = resolveMinimalEquipmentNodes(fixture.model);
	const receipt = applyMinimalGarmentVisibility(nodes, equipment);
	assert.ok(receipt.active.includes('tefillin-head'));
	assert.equal(fixture.jacket.visible, false);
	assert.equal(fixture.tefillinJacket.visible, true);
	assert.equal(fixture.tefillinJacket.children[0].visible, false);
	assert.equal(fixture.body.visible, false);
	const appearance = applyMinimalGarmentAppearance(nodes.wardrobe, equipment, {
		'black-coat': { colorId: 'blue', fabricId: 'wool' }
	});
	assert.equal(appearance.jacket.colorId, 'blue');
	assert.equal(firstMaterial(fixture.jacket).texturePolicy.remoteOnly, true);
	assert.equal(fixture.jacket.children[0].visible, false);
});

function wardrobeFixture() {
	const jacket = garmentRoot('jacket', 'jacket');
	const tefillinJacket = garmentRoot('jacket-teffilin', 'jacket-tefillin');
	const body = meshNode('body', ['shirt', 'pants', 'shoes']);
	const model = tree('chossid', [
		jacket,
		tefillinJacket,
		garmentRoot('glasses', 'glasses-frame', ['glasses-glass']),
		garmentRoot('top-hat', 'hat'),
		garmentRoot('yarmulka', 'yarmulka', [], true),
		garmentRoot('tefillin-head-box', 'batim'),
		garmentRoot('head-teffilin-straps', 'head-straps'),
		garmentRoot('teffiln-arm-box', 'shel-yad'),
		garmentRoot('tefillin-arm-straps', 'arm-straps'),
		garmentRoot('outer-shirt', 'shirt-outer'),
		body,
		tree('mixamorig:RightHand', []),
		tree('mixamorig:LeftHand', []),
		tree('mixamorig:Spine2', [])
	]);
	return { body, jacket, model, tefillinJacket };
}

function firstMaterial(root) {
	return root.children[0].material[0];
}

function garmentRoot(garment, materialName, extras = [], misspelled = false) {
	const root = tree(garment, [meshNode(`${garment}-mesh`, [materialName, ...extras])]);
	root.userData.gltfNode = { extras: { [misspelled ? 'garament' : 'garment']: garment } };
	return root;
}

function meshNode(name, materials) {
	const value = tree(name, []);
	value.isMesh = true;
	value.material = materials.map(materialName => ({ color: [1, 1, 1, 1], name: materialName, userData: {} }));
	return value;
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
