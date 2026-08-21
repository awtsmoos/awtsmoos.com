//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos holds hub, realm, teaching, and rendering beneath every finite viewport and implementation name;
 * Awtsmoos.com proves bounded layers, fixed foundations, touch-safe movement, and portable procedural geometry for the native road.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readSevenSource } from "./test-source-reader.mjs";

const GAME_IDS = [
	"false-powers", "words-of-creation", "every-life", "households",
	"honest-market", "living-sanctuary", "court-of-nations"
];

test("entry contains one fixed app, persistent realm, and account drawer", () => {
	const html = readSevenSource("index.html");
	const template = readSevenSource("js/realm/realm-template.js");
	assert.match(html, /id="sevenMitzvosApp"/);
	assert.match(readSevenSource("js/app/app-template.js"), /id="realmLayer"/);
	assert.match(template, /id="realmAccountDrawer"/);
	assert.match(template, /id="realmAccountToggle"/);
});

test("router exposes hub, detail, game, and realm routes", () => {
	const source = readSevenSource("js/app/hash-router.js");
	for (const pattern of [
		/hash === 'realm'/,
		/view === 'realm'/,
		/\['world-',\s*'game'\]/,
		/\['play-',\s*'game'\]/,
		/\['mitzvah-',\s*'detail'\]/
	]) {
		assert.match(source, pattern);
	}
});

test("application owns three persistent layers and one disposable realm session", () => {
	const source = readSevenSource("js/app/seven-mitzvos-app.js");
	assert.match(source, /new RealmSession/);
	assert.match(source, /this\.realm\.start/);
	assert.match(source, /this\.realm\.stop/);
	assert.match(source, /\['hub', 'game', 'realm'\]/);
	assert.match(source, /this\.world\.route\(route\)/);
});

test("viewport foundation, realm, and account drawer confine scrolling", () => {
	const shell = readSevenSource("styles/viewport-shell/base.css");
	const realm = readSevenSource("styles/realm-shell.css");
	const account = readSevenSource("styles/realm-account.css");
	assert.match(shell, /height:\s*100dvh/);
	assert.match(shell, /html,[\s\S]*body,[\s\S]*#sevenMitzvosApp[\s\S]*overflow:\s*hidden/);
	assert.match(realm, /\.realmLayer\s*\{[\s\S]*overflow:\s*hidden/);
	assert.match(account, /\.realmAccountScroll[\s\S]*overflow:\s*auto/);
});

test("mobile world controls provide stable forty-eight-pixel touch geometry", () => {
	const mobile = readSevenSource("styles/mobile-controls.css");
	assert.match(mobile, /grid-template-columns:\s*repeat\(3,\s*48px\)/);
	assert.match(mobile, /grid-template-rows:\s*repeat\(2,\s*48px\)/);
	assert.match(mobile, /min-height:\s*48px/);
	assert.match(mobile, /min-width:\s*48px/);
	assert.match(mobile, /@media \(pointer: coarse\), \(max-width: 760px\)/);
	assert.match(mobile, /#worldInteract[\s\S]*min-height:\s*48px/);
});

test("registry retains seven separate teaching controllers", () => {
	const source = readSevenSource("js/games3d/game-registry.js");
	for (const id of GAME_IDS) {
		assert.match(source, new RegExp(`'${id}'\\s*:`));
	}
	assert.equal(
		(source.match(/:\s*[A-Z][A-Za-z]+Game/g) || []).length,
		7
	);
});

test("renderer, picker, and procedural core expose real bounded contracts", () => {
	const stage = readSevenSource("js/webgl/webgl-stage.js");
	const picker = readSevenSource("js/webgl/semantic-picker.js");
	const cache = readSevenSource("js/procedural/core-part-geometry-cache.js");
	assert.match(stage, /render\(|destroy\(|forceContextLoss/);
	assert.match(picker, /pick\(|intersectObjects|targets/);
	assert.match(cache, /generateProceduralGeometry/);
	assert.match(cache, /renderDataByProfile/);
	assert.doesNotMatch(cache, /createProceduralThreeMesh|three\.module\.js|THREE\./);
});
