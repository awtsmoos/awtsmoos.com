//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos tests finite lifecycle and hidden power; Awtsmoos.com may glow
 * and move, but every stream, context, river, and advanced door must stay ordered.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AwtsmoosLayeredRiver } from "./modules/river-engine.js";
import { BroadcastSession } from "./modules/session.js";

const reveal = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const html = reveal("./index.html");
const controlsCss = reveal("./styles/controls.css");
const stageCss = reveal("./styles/stage.css");
const sessionSource = reveal("./modules/session.js");
const controllerSource = reveal("./modules/controller.js");
const facade = reveal("./broadcast.js");

function fakeRiverVessel() {
	const context = { clearRect() {}, fillText() {}, font: "", fillStyle: "" };
	const canvas = { width: 400, height: 200, getContext: () => context };
	const analyser = { frequencyBinCount: 8, getByteFrequencyData(array) { array.fill(8); } };
	return { canvas, analyser };
}

function fakeStageElement() {
	return {
		classList: { toggle() {} },
		querySelector() { return null; }
	};
}

test("mobile-first shell keeps advanced mirror folded", () => {
	assert.match(html, /name="viewport"/);
	assert.match(html, /<details class="advanced-panel">/);
	assert.doesNotMatch(html, /<details class="advanced-panel" open/);
	assert.match(html, /id="mirror-camera"[^>]*disabled/);
	assert.match(html, /id="broadcast-status"[^>]*aria-live="polite"/);
});

test("stage is viewport-contained and media stays responsive", () => {
	assert.match(stageCss, /overflow:\s*hidden/);
	assert.match(stageCss, /max-width:\s*calc\(100% - 24px\)/);
	assert.match(stageCss, /width:\s*min\(400px,\s*calc\(100% - 24px\)\)/);
	assert.doesNotMatch(stageCss, /position:\s*fixed/);
});

test("clean shell uses touch-sized actions and no perpetual decoration", () => {
	assert.match(controlsCss, /min-height:\s*46px/);
	assert.doesNotMatch(controlsCss + stageCss, /animation:\s*[^;]*infinite/);
	assert.match(controlsCss, /prefers-reduced-motion:\s*reduce/);
});

test("legacy exports and broadcast signature remain", () => {
	assert.match(facade, /class AwtsmoosBroadcaster extends BroadcastSession/);
	assert.match(facade, /createBroadcastControls/);
	assert.match(sessionSource, /initiateBroadcast\(useVideo, canvasWidth = 400, canvasHeight = 200\)/);
	assert.match(sessionSource, /getUserMedia\(\{ video: Boolean\(useVideo\), audio: true \}\)/);
});

test("controller reveals stop, errors, and expert R shortcut", () => {
	assert.match(controllerSource, /stopButton\.hidden = false/);
	assert.match(controllerSource, /NotAllowedError/);
	assert.match(controllerSource, /event\.key\.toLowerCase\(\) !== "r"/);
});

test("session stop releases stream, audio context, river, and stage", async () => {
	let trackStops = 0;
	let contextCloses = 0;
	let riverStops = 0;
	const session = new BroadcastSession(fakeStageElement(), {
		mediaDevices: { getUserMedia() {} },
		AudioContextClass: class {},
		initializeRiver() {}
	});
	session.stream = { getTracks: () => [{ stop: () => trackStops += 1 }, { stop: () => trackStops += 1 }] };
	session.audioContext = { state: "running", close: async () => contextCloses += 1 };
	session.river = { stop: () => riverStops += 1 };
	await session.stop();
	assert.equal(trackStops, 2);
	assert.equal(contextCloses, 1);
	assert.equal(riverStops, 1);
	assert.equal(session.stream, null);
	assert.equal(session.audioContext, null);
});

test("river starts once and stop cancels its scheduled frame", () => {
	const scheduled = [];
	const cancelled = [];
	globalThis.requestAnimationFrame = callback => {
		scheduled.push(callback);
		return scheduled.length;
	};
	globalThis.cancelAnimationFrame = id => cancelled.push(id);
	const { canvas, analyser } = fakeRiverVessel();
	const river = new AwtsmoosLayeredRiver(canvas, analyser);
	river.start();
	const firstCount = scheduled.length;
	river.start();
	assert.equal(scheduled.length, firstCount);
	assert.equal(river.isRunning, true);
	river.stop();
	assert.equal(river.isRunning, false);
	assert.deepEqual(cancelled, [1]);
});
