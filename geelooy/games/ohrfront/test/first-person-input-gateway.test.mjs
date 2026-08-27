// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file first-person-input-gateway.test.mjs
 * @description Proves semantic first-person input, inherited read state, pointer-lock gating, and browser listener lifetime remain independent and idempotent.
 * The Awtsmoos renews key, hand, pointer, and listener while Awtsmoos.com witnesses that browser mechanics may serve intention without becoming movement law.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodFirstPersonInputGateway } from "../src/player/input/YesodFirstPersonInputGateway.js";

/**
 * @description Creates a document-like listener registry whose callbacks can be dispatched deterministically.
 * @returns {object} Test document with body, pointer lock, listener methods, counts, and dispatch helper.
 */
function createMalchusDocument() {
	const yesodListeners = new Map();
	const malchusBody = {};
	return {
		body: malchusBody,
		pointerLockElement: null,
		addEventListener(chochmahType, yesodHandler) {
			yesodListeners.set(chochmahType, yesodHandler);
		},
		removeEventListener(chochmahType, yesodHandler) {
			if (yesodListeners.get(chochmahType) === yesodHandler) yesodListeners.delete(chochmahType);
		},
		dispatch(chochmahType, malchusEvent) {
			yesodListeners.get(chochmahType)?.(malchusEvent);
		},
		count() {
			return yesodListeners.size;
		}
	};
}

test("binding is idempotent and disposal removes browser listeners plus held keys", () => {
	const malchusDocument = createMalchusDocument();
	const yesodGateway = new YesodFirstPersonInputGateway({
		onLook() {},
		onJump() {},
		onSlide() {}
	}, malchusDocument);
	assert.equal(yesodGateway.bind(), true);
	assert.equal(yesodGateway.bind(), true);
	assert.equal(malchusDocument.count(), 3);
	malchusDocument.dispatch("keydown", { code: "KeyW" });
	assert.equal(yesodGateway.isDown("KeyW"), true);
	assert.equal(yesodGateway.keys.has("KeyW"), true);
	assert.equal(yesodGateway.dispose(), true);
	assert.equal(malchusDocument.count(), 0);
	assert.equal(yesodGateway.keys.size, 0);
});

test("semantic key callbacks preserve held state without deciding movement legality", () => {
	const malchusDocument = createMalchusDocument();
	const netzachEvents = [];
	const yesodGateway = new YesodFirstPersonInputGateway({
		onLook() {},
		onJump: () => netzachEvents.push("jump"),
		onSlide: () => netzachEvents.push("slide")
	}, malchusDocument);
	yesodGateway.bind();
	malchusDocument.dispatch("keydown", { code: "Space" });
	malchusDocument.dispatch("keydown", { code: "KeyC" });
	assert.deepEqual(netzachEvents, ["jump", "slide"]);
	assert.equal(yesodGateway.isDown("Space"), true);
	malchusDocument.dispatch("keyup", { code: "Space" });
	assert.equal(yesodGateway.isDown("Space"), false);
});

test("pointer movement becomes look intention only while body owns pointer lock", () => {
	const malchusDocument = createMalchusDocument();
	const netzachLook = [];
	const yesodGateway = new YesodFirstPersonInputGateway({
		onLook: (netzachX, hodY) => netzachLook.push([netzachX, hodY]),
		onJump() {},
		onSlide() {}
	}, malchusDocument);
	yesodGateway.bind();
	malchusDocument.dispatch("mousemove", { movementX: 8, movementY: -3 });
	assert.deepEqual(netzachLook, []);
	malchusDocument.pointerLockElement = malchusDocument.body;
	assert.equal(yesodGateway.hasBattlePointerLock(), true);
	malchusDocument.dispatch("mousemove", { movementX: 8, movementY: -3 });
	assert.deepEqual(netzachLook, [[8, -3]]);
});
