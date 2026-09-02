// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-weapon-input.test.mjs
 * @description Proves FIRE owns one touch globally while other fingers may still select weapons without releasing the held trigger.
 * The Awtsmoos renews trigger, weapon, finger, and release beyond the glass beneath their finite touch;
 * Awtsmoos.com lets movement and aim continue while only the true FIRE owner may close the projectile gate in battle's rush.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodTouchWeaponInputGateway } from "../src/combat/weapons/YesodTouchWeaponInputGateway.js";

function createTarget(weapon = null) {
	const listeners = new Map();
	return {
		dataset: weapon === null ? {} : { ohrTouchWeapon: String(weapon) }, attributes: new Map(),
		addEventListener(type, handler) { listeners.set(type, handler); },
		removeEventListener(type) { listeners.delete(type); },
		setPointerCapture() {}, releasePointerCapture() {},
		setAttribute(name, value) { this.attributes.set(name, value); },
		dispatch(type, event = {}) { listeners.get(type)?.({ preventDefault() {}, ...event }); }
	};
}

function createHarness() {
	const fire = createTarget();
	const weapons = [createTarget(0), createTarget(1), createTarget(2)];
	const windowAuthority = createTarget();
	Object.assign(windowAuthority, { navigator: { maxTouchPoints: 5 }, matchMedia: () => ({ matches: true }), devicePixelRatio: 3 });
	const trigger = [];
	const selections = [];
	const gateway = new YesodTouchWeaponInputGateway({ onSelect: index => selections.push(index), onTriggerChange: held => trigger.push(held) }, {
		defaultView: windowAuthority,
		querySelector: selector => selector === "#touch-fire" ? fire : null,
		querySelectorAll: () => weapons
	});
	return { fire, weapons, windowAuthority, trigger, selections, gateway };
}

test("wrong finger release cannot cancel held FIRE while weapon selection remains live", () => {
	const h = createHarness();
	assert.equal(h.gateway.bind(), true);
	h.fire.dispatch("pointerdown", { pointerType: "touch", pointerId: 4 });
	h.windowAuthority.dispatch("pointerup", { pointerType: "touch", pointerId: 8 });
	h.weapons[1].dispatch("pointerdown", { pointerType: "touch", pointerId: 8 });
	assert.deepEqual(h.trigger, [true]);
	assert.deepEqual(h.selections, [1]);
	h.windowAuthority.dispatch("pointerup", { pointerType: "touch", pointerId: 4 });
	assert.deepEqual(h.trigger, [true, false]);
});

test("lost capture releases FIRE and active weapon semantics remain explicit", () => {
	const h = createHarness();
	h.gateway.bind();
	h.fire.dispatch("pointerdown", { pointerType: "touch", pointerId: 2 });
	h.fire.dispatch("lostpointercapture", { pointerType: "touch", pointerId: 2 });
	assert.deepEqual(h.trigger, [true, false]);
	h.gateway.setActiveIndex(2);
	assert.equal(h.weapons[2].attributes.get("aria-pressed"), "true");
	assert.equal(h.fire.attributes.get("aria-pressed"), "false");
});
