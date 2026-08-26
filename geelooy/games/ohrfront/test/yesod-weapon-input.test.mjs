// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file yesod-weapon-input.test.mjs
 * @description Proves browser events are translated into semantic weapon intentions without requiring a player, emitter, projectile system, or real DOM.
 * Yesod connects event to intention while the Awtsmoos remains beyond listener and command;
 * Awtsmoos.com lets this test show that browser mechanics can be replaced by a small deterministic gateway rather than inhabiting the weapon domain itself.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodWeaponInputGateway } from "../src/combat/weapons/YesodWeaponInputGateway.js";

function createYesodDocument() {
	const yesodListeners = new Map();
	const malchusBody = {};
	return {
		body: malchusBody,
		pointerLockElement: null,
		listeners: yesodListeners,
		addEventListener(yesodName, yesodListener) {
			yesodListeners.set(yesodName, yesodListener);
		}
	};
}

test("gateway binds once and translates number keys into weapon indices", () => {
	const yesodDocument = createYesodDocument();
	const tiferesSelections = [];
	const yesodGateway = new YesodWeaponInputGateway({
		onSelect: tiferesIndex => tiferesSelections.push(tiferesIndex),
		onTriggerChange: () => {}
	}, yesodDocument);
	assert.equal(yesodGateway.bind(), true);
	assert.equal(yesodGateway.bind(), true);
	yesodDocument.listeners.get("keydown")({ code: "Digit3" });
	assert.deepEqual(tiferesSelections, [2]);
	assert.equal(yesodDocument.listeners.size, 3);
});

test("primary trigger requires body pointer lock but release always clears", () => {
	const yesodDocument = createYesodDocument();
	const tiferesTriggerStates = [];
	const yesodGateway = new YesodWeaponInputGateway({
		onSelect: () => {},
		onTriggerChange: yesodHeld => tiferesTriggerStates.push(yesodHeld)
	}, yesodDocument);
	yesodGateway.bind();
	yesodDocument.listeners.get("mousedown")({ button: 0 });
	yesodDocument.pointerLockElement = yesodDocument.body;
	yesodDocument.listeners.get("mousedown")({ button: 0 });
	yesodDocument.pointerLockElement = null;
	yesodDocument.listeners.get("mouseup")({ button: 0 });
	assert.deepEqual(tiferesTriggerStates, [true, false]);
});
