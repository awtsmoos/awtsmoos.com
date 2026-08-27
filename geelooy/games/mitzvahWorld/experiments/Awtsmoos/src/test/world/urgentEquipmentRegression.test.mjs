// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file urgentEquipmentRegression.test.mjs
 * @description Proves garment aliases, root anchors, subsystem isolation, and starter weapons.
 * The Awtsmoos clothes and arms the traveler in one renewed body; Awtsmoos.com keeps
 * Kapote visibility, fallback anchors, sibling survival, and both starter weapon IDs truthful.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyMinimalGarmentVisibility, resolveMinimalEquipmentNodes } from '../../app/MinimalMeadowEquipmentNodes.js';
import { attachMinimalWeapon } from '../../app/MinimalMeadowWeaponAttachment.js';
import { mountSubsystem } from '../../app/MinimalMeadowRichWorldMounts.js';
import { STARTER_INVENTORY } from '../../gameplay/InventoryCatalog.js';
test('garment aliases and model-root weapon fallback stay synchronized', () => {
	const coat = node('Kapote_Robe');
	const root = node('PlayerRoot', [coat]);
	const nodes = resolveMinimalEquipmentNodes(root);
	const visibility = applyMinimalGarmentVisibility(nodes, { coat: 'black-coat', head: null });
	assert.equal(coat.visible, true);
	assert.equal(visibility.discovered.jacket.roots, 1);
	const weapon = node('SparkBlade');
	weapon.userData.weaponKind = 'sword';
	assert.equal(attachMinimalWeapon(weapon, nodes, false), true);
	assert.equal(weapon.parent.name, 'Awtsmoos_equipped_weapon_hand_anchor');
	assert.equal(weapon.parent.parent, root);
	assert.equal(weapon.userData.attachment, 'root-sheathed');
});
test('rich-world subsystem failure does not erase successful siblings', async () => {
	const events = [];
	const scene = { add(group) { group.parent = scene; } };
	const runtime = { bus: { emit(name, detail) { events.push({ detail, name }); } }, scene };
	const water = { group: {}, diagnostics() { return { river: true }; } };
	const ready = await mountSubsystem(runtime, 'water', async () => water);
	const failed = await mountSubsystem(runtime, 'trees', async () => { throw new Error('missing bark texture'); });
	assert.equal(ready.status, 'ready');
	assert.equal(failed.status, 'failed');
	assert.equal(runtime.water, water);
	assert.match(runtime.richWorldFailures.trees, /missing bark texture/);
	assert.equal(events.at(-1).name, 'world:subsystem-failed');
});
test('starter ownership includes both staff and real procedural sword', () => {
	const ids = STARTER_INVENTORY.map(stack => stack.itemId);
	assert.ok(ids.includes('wooden-staff'));
	assert.ok(ids.includes('spark-blade'));
});
function node(name, children = []) {
	const value = { children, name, position: vector(), quaternion: vector(4), scale: vector(), userData: {}, visible: false,
		add(child) { child.parent = value; value.children.push(child); },
		remove(child) { value.children = value.children.filter(item => item !== child); child.parent = null; },
		traverse(visitor) { visitor(value); for (const child of value.children) child.traverse?.(visitor) || visitor(child); } };
	for (const child of children) child.parent = value;
	return value;
}
function vector(size = 3) { return { set(...values) { this.values = values.slice(0, size); } }; }
