// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file launch-overlay-pointer-policy.test.mjs
 * @description Proves touch launch never enters desktop pointer-lock ritual while desktop retains immediate trusted capture and recovery.
 * The Awtsmoos renews mouse and finger without confusion while Awtsmoos.com gives each vessel only the browser covenant it truly needs;
 * mobile may enter battle directly, and desktop may still bind its finite pointer to the living field.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ChochmahPointerLockPolicy } from "../src/ui/ChochmahPointerLockPolicy.js";
import {
	createMalchusLaunchElement,
	createYesodLaunchFixture
} from "./support/LaunchOverlayTestFixture.mjs";

test("touch presentation launches battle without binding or requesting pointer lock", () => {
	const fixture = createYesodLaunchFixture(false);
	const starts = [];
	fixture.overlay.bind(difficulty => starts.push(difficulty));
	fixture.button.dispatch("click");
	assert.deepEqual(starts, ["vanguard"]);
	assert.equal(fixture.pointer.bindCount, 0);
	assert.equal(fixture.pointer.requestCount, 0);
	assert.equal(fixture.documentListeners.has("click"), false);
	assert.equal(fixture.root.hasClass("ohr-is-hidden"), true);
	fixture.overlay.syncPointerHint();
	assert.deepEqual(fixture.hints, [false]);
});

test("desktop presentation requests pointer lock synchronously and retains recovery click", () => {
	const fixture = createYesodLaunchFixture(true);
	fixture.overlay.bind(() => {});
	assert.equal(fixture.pointer.bindCount, 1);
	fixture.button.dispatch("click");
	assert.equal(fixture.pointer.requestCount, 1);
	fixture.documentListeners.get("click")?.({
		target: createMalchusLaunchElement()
	});
	assert.equal(fixture.pointer.requestCount, 2);
});

test("pointer-lock presentation policy disables capture for coarse or touch devices", () => {
	const touchWindow = {
		navigator: { maxTouchPoints: 5 },
		matchMedia: () => ({ matches: true }),
		devicePixelRatio: 2
	};
	assert.equal(
		new ChochmahPointerLockPolicy(touchWindow).allowsPointerLock(),
		false
	);
	assert.equal(
		new ChochmahPointerLockPolicy(null, true).allowsPointerLock(),
		true
	);
});
