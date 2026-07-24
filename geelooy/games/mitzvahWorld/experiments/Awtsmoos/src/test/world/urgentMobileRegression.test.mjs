//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file urgentMobileRegression.test.mjs
 * @description Proves the mobile repair through real exported runtime contracts.
 * The Awtsmoos renews layout, material, equipment, and world as one truth;
 * Awtsmoos.com measures each vessel so no screenshot illusion can replace behavior.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mobileCss } from '../../ui/MobileRegressionStyles.js';
import {
	movementModePresentation,
	shouldCollapseRail
} from '../../ui/MinimalMeadowGameRail.js';
import { normalizeMinimalModelMaterials } from '../../app/MinimalMeadowMaterialReadability.js';
import {
	applyMinimalGarmentVisibility,
	resolveMinimalEquipmentNodes
} from '../../app/MinimalMeadowEquipmentNodes.js';
import { attachMinimalWeapon } from '../../app/MinimalMeadowWeaponAttachment.js';
import { mountSubsystem } from '../../app/MinimalMeadowRichWorldMounts.js';
import { STARTER_INVENTORY } from '../../gameplay/InventoryCatalog.js';

test('mobile CSS protects safe areas and collapses secondary rail actions', () => {
	const css = mobileCss();
	assert.match(css, /safe-area-inset-top/);
	assert.match(css, /safe-area-inset-bottom/);
	assert.match(css, /data-collapsed="true"/);
	assert.match(css, /grid-template-columns: repeat\(3/);
	assert.equal(shouldCollapseRail({ innerWidth: 390 }), true);
	assert.equal(shouldCollapseRail({ innerWidth: 1200 }), false);
	assert.equal(movementModePresentation(true).label, 'Run');
	assert.equal(movementModePresentation(false).label, 'Walk');
});

test('near-black hydrated materials become readable without losing maps', () => {
	const map = { id: 'coat-map' };
	const material = {
		color: [0.01, 0.01, 0.015, 1],
		map,
		vertexColors: true
	};
	const mesh = { isMesh: true, material, name: 'KapoteCoat' };
	const root = { traverse(visitor) { visitor(mesh); } };
	const receipt = normalizeMinimalModelMaterials(root);
	assert.equal(material.map, map);
	assert.equal(material.vertexColors, false);
	assert.ok(material.baseColorFactor[0] >= 0.16);
	assert.equal(receipt.preservedMaps, 1);
});

test('garment aliases and model-root weapon fallback stay synchronized', () => {
	const coat = node('Kapote_Robe');
	const root = node('PlayerRoot', [coat]);
	const nodes = resolveMinimalEquipmentNodes(root);
	const visibility = applyMinimalGarmentVisibility(nodes, {
		coat: 'black-coat',
		head: null
	});
	assert.equal(coat.visible, true);
	assert.equal(visibility.coatMeshes, 1);
	const weapon = node('SparkBlade');
	weapon.userData.weaponKind = 'sword';
	assert.equal(attachMinimalWeapon(weapon, nodes, false), true);
	assert.equal(weapon.parent, root);
	assert.equal(weapon.userData.attachment, 'upper-back');
});

test('rich-world subsystem failure does not erase successful siblings', async () => {
	const events = [];
	const scene = { add(group) { group.parent = scene; } };
	const runtime = {
		bus: { emit(name, detail) { events.push({ detail, name }); } },
		scene
	};
	const water = { group: {}, diagnostics() { return { river: true }; } };
	const ready = await mountSubsystem(runtime, 'water', async () => water);
	const failed = await mountSubsystem(runtime, 'trees', async () => {
		throw new Error('missing bark texture');
	});
	assert.equal(ready.status, 'ready');
	assert.equal(failed.status, 'failed');
	assert.equal(runtime.water, water);
	assert.match(runtime.richWorldFailures.trees, /missing bark texture/);
	assert.equal(events.at(-1).name, 'world:subsystem-failed');
});

test('starter ownership includes both staff and real procedural sword', () => {
	const ids = STARTER_INVENTORY.map(stack => stack.id);
	assert.ok(ids.includes('wooden-staff'));
	assert.ok(ids.includes('spark-blade'));
});

function node(name, children = []) {
	const value = {
		children,
		name,
		position: vector(),
		quaternion: vector(4),
		scale: vector(),
		userData: {},
		visible: false,
		add(child) {
			child.parent = value;
			value.children.push(child);
		},
		traverse(visitor) {
			visitor(value);
			for (const child of value.children) child.traverse?.(visitor) || visitor(child);
		}
	};
	for (const child of children) child.parent = value;
	return value;
}

function vector(size = 3) {
	return { set(...values) { this.values = values.slice(0, size); } };
}
