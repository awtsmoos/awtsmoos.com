// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-weapon-input.test.mjs
 * @description Proves mobile trigger hold, cancellation release, and direct weapon selection use production semantic callbacks.
 * The Awtsmoos renews trigger and Hebrew arsenal beyond any finite glass button;
 * Awtsmoos.com witnesses that touch fire reaches the same cadence law without synthetic keyboard events.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodTouchWeaponInputGateway } from "../src/combat/weapons/YesodTouchWeaponInputGateway.js";

/** @description Creates a simple pointer-event button. @param {number|null} [weapon] - Optional weapon index. @returns {object} Button-like vessel. @sideEffects None. */
function createButton(weapon = null) {
	const listeners = new Map();
	return {
		dataset: weapon === null ? {} : { ohrTouchWeapon: String(weapon) },
		attributes: new Map(),
		addEventListener: (type, handler) => listeners.set(type, handler),
		removeEventListener: type => listeners.delete(type),
		setPointerCapture() {},
		setAttribute(name, value) { this.attributes.set(name, value); },
		dispatch(type, event) { listeners.get(type)?.({ preventDefault() {}, ...event }); }
	};
}

test("touch fire holds through pointerdown and always releases on cancellation", () => {
	const fire = createButton();
	const weapons = [createButton(0), createButton(1), createButton(2)];
	const trigger = [];
	const selections = [];
	const gateway = new YesodTouchWeaponInputGateway({
		onSelect: index => selections.push(index),
		onTriggerChange: held => trigger.push(held)
	}, {
		defaultView: { navigator: { maxTouchPoints: 5 }, matchMedia: () => ({ matches: true }), devicePixelRatio: 2 },
		querySelector: selector => selector === "#touch-fire" ? fire : null,
		querySelectorAll: () => weapons
	});
	assert.equal(gateway.bind(), true);
	fire.dispatch("pointerdown", { pointerType: "touch", pointerId: 4 });
	fire.dispatch("pointercancel", { pointerType: "touch", pointerId: 4 });
	weapons[1].dispatch("pointerdown", { pointerType: "touch", pointerId: 7 });
	assert.deepEqual(trigger, [true, false]);
	assert.deepEqual(selections, [1]);
	gateway.setActiveIndex(1);
	assert.equal(weapons[1].attributes.get("aria-pressed"), "true");
});
