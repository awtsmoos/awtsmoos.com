// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos sends every hidden setting through ordered vessels into visible Malchus;
 * Awtsmoos.com tests that the clean studio still carries its full rendering, memory, and export power.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

/** Reveal one local runtime vessel as text. */
function revealOhr(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const coordinator = revealOhr("./js/YesodRenderCoordinator.js");
const workerEntry = revealOhr("./worker/ein-sof-worker.js");
const core = revealOhr("./worker/BorehOlam.js");
const preview = revealOhr("./js/MalchusPreview.js");
const store = revealOhr("./js/ChesedSettingsStore.js");
const codec = revealOhr("./js/ChesedSettingsCodec.js");
const downloads = revealOhr("./js/HodDownloadManager.js");
const workerFiles = readdirSync(new URL("./worker/", import.meta.url)).filter(name => name.endsWith(".js"));
const workerSource = workerFiles.map(name => revealOhr(`./worker/${name}`)).join("\n");

test("module Worker and coordinator share one explicit message protocol", () => {
	assert.match(coordinator, /new Worker\([\s\S]*type:\s*"module"/);
	assert.match(coordinator, /type:\s*"generate"[\s\S]*captions[\s\S]*header[\s\S]*settings/);
	for (const type of ["progress", "result", "complete", "error"]) {
		assert.match(workerEntry, new RegExp(`type:\\s*"${type}"`));
	}
	assert.match(workerEntry, /type:\s*"result",\s*bitmap,\s*index/);
	assert.match(coordinator, /message\.bitmap/);
	assert.match(coordinator, /message\.index/);
});

test("renderer keeps canonical portrait output and ordered visual pipeline", () => {
	assert.match(core, /width:\s*1080,\s*height:\s*1920/);
	const stages = ["OlamBackground", "YetzirahParticles", "KavNetwork", "HodBloom", "TiferesText", "HodPost", "MalchusCorner"];
	let previous = -1;
	for (const stage of stages) {
		const current = core.indexOf(`new ${stage}`);
		assert.ok(current > previous, `${stage} must retain pipeline order`);
		previous = current;
	}
});

test("every advanced visual setting reaches worker rendering source", () => {
	const keys = [
		"boxColor", "boxOpacity", "boxPadding", "boxRadius", "particleDensity", "minParticleSize",
		"maxParticleSize", "particleStyle", "particleChars", "networkType", "connectionDensity",
		"baseBgColor", "filmGrain", "bloomIntensity"
	];
	for (const key of keys) {
		assert.ok(workerSource.includes(key), `${key} must affect rendering`);
	}
});

test("JPEG export remains high quality and visible numbering stays one based", () => {
	assert.match(preview, /"image\/jpeg",\s*\.92/);
	assert.match(downloads, /index \+ 1/);
	assert.match(downloads, /BH_\$\{Date\.now\(\)\}_EinSof_/);
});

test("settings persistence keeps the historical version-two inline id key", () => {
	assert.match(store, /databaseName\s*=\s*"EinSofEngineDB"/);
	assert.match(store, /storeName\s*=\s*"settingsStore"/);
	assert.match(store, /version\s*=\s*2/);
	assert.match(store, /key\s*=\s*"userSettings"/);
	assert.match(store, /keyPath:\s*"id"/);
	assert.match(store, /\.put\(\s*this\.codec\.collect\(ChesedSettingsStore\.key\)\s*\)/s);
	assert.match(codec, /id:\s*recordId/);
});

test("Worker graph is modular rather than returning to an inline monolith", () => {
	assert.ok(workerFiles.length >= 12);
	assert.match(workerEntry, /import \{ BorehOlam \}/);
	assert.match(workerEntry, /import \{ ChesedRandom \}/);
	assert.doesNotMatch(workerEntry, /<script/i);
});
