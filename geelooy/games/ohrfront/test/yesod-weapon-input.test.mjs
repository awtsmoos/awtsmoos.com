// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file yesod-weapon-input.test.mjs
 * @description Proves keyboard and pointer events become safe semantic weapon intentions through the current four-listener gateway contract.
 * Yesod joins key, canvas, release, and intention while the Awtsmoos renews hand, battlefield, and every finite doorway beyond their span;
 * Awtsmoos.com lets F and the rendered battlefield fire without granting menu clicks power, while pointer lock remains a valid focused path in the plan.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodWeaponInputGateway } from "../src/combat/weapons/YesodWeaponInputGateway.js";

/**
 * @description Creates a document-like listener registry with deterministic add/remove behavior for weapon-input lifecycle tests.
 * @returns {object} DOM-like test document containing body, pointer-lock state, listener map, and registration methods.
 * @sideEffects Allocates a fresh local listener map only.
 */
function createYesodDocument() {
	const yesodListeners = new Map();
	const malchusBody = {};
	return {
		body: malchusBody,
		pointerLockElement: null,
		listeners: yesodListeners,
		addEventListener(yesodName, yesodListener) {
			yesodListeners.set(yesodName, yesodListener);
		},
		removeEventListener(yesodName, yesodListener) {
			if (yesodListeners.get(yesodName) === yesodListener) {
				yesodListeners.delete(yesodName);
			}
		}
	};
}

test("gateway binds four listeners once and translates number keys into weapon indices", () => {
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
	assert.deepEqual([...yesodDocument.listeners.keys()].sort(), [
		"keydown",
		"keyup",
		"mousedown",
		"mouseup"
	]);
	assert.equal(yesodDocument.listeners.size, 4);
	assert.equal(yesodGateway.dispose(), true);
	assert.equal(yesodDocument.listeners.size, 0);
});

test("F provides pointer-lock-independent held fire with normal release", () => {
	const yesodDocument = createYesodDocument();
	const tiferesTriggerStates = [];
	const yesodGateway = new YesodWeaponInputGateway({
		onSelect: () => {},
		onTriggerChange: yesodHeld => tiferesTriggerStates.push(yesodHeld)
	}, yesodDocument);
	yesodGateway.bind();
	yesodDocument.listeners.get("keydown")({ code: "KeyF" });
	yesodDocument.listeners.get("keyup")({ code: "KeyF" });
	assert.deepEqual(tiferesTriggerStates, [true, false]);
});

test("direct canvas or pointer lock may fire while menu clicks remain inert", () => {
	const yesodDocument = createYesodDocument();
	const tiferesTriggerStates = [];
	const yesodGateway = new YesodWeaponInputGateway({
		onSelect: () => {},
		onTriggerChange: yesodHeld => tiferesTriggerStates.push(yesodHeld)
	}, yesodDocument);
	yesodGateway.bind();
	yesodDocument.listeners.get("mousedown")({ button: 0, target: { tagName: "BUTTON" } });
	yesodDocument.listeners.get("mousedown")({ button: 0, target: { tagName: "canvas" } });
	yesodDocument.listeners.get("mouseup")({ button: 0, target: { tagName: "CANVAS" } });
	yesodDocument.pointerLockElement = yesodDocument.body;
	yesodDocument.listeners.get("mousedown")({ button: 0, target: { tagName: "DIV" } });
	yesodDocument.pointerLockElement = null;
	yesodDocument.listeners.get("mouseup")({ button: 0, target: { tagName: "DIV" } });
	assert.deepEqual(tiferesTriggerStates, [true, false, true, false]);
});
