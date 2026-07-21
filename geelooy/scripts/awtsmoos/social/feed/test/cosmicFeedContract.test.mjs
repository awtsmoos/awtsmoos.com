// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedContractTests
 * @description
 * The Awtsmoos is One, yet every Awtsmoos.com feed vessel receives a precise
 * contract for semantics, dispatch, accessibility, cleanup, and modular boundaries.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const cosmicRoot = fileURLToPath(new URL("../cosmic/", import.meta.url));
const modules = collectModules(cosmicRoot);
const read = relativePath => readFileSync(path.join(cosmicRoot, relativePath), "utf8");

test("cosmic cards preserve semantic source-aware article structure", () => {
	const source = read("postCard.js");
	assert.match(source, /createElement\(documentRef,\s*"article"/);
	assert.match(source, /renderSourceRail/);
	assert.match(source, /aria-labelledby/);
	assert.match(source, /renderPostIdentity/);
	assert.match(source, /renderPostActions/);
});

test("specialized dispatch covers all required archetypes", () => {
	const source = read("dispatch.js");
	for (const archetype of ["audio", "default", "question", "reflection", "source-graph"]) {
		assert.ok(source.includes(archetype), `missing ${archetype} renderer`);
	}
});

test("question posts expose real keyboard-operable poll controls", () => {
	const source = read("renderers/question.js");
	assert.match(source, /createElement\(documentRef,\s*"fieldset"/);
	assert.match(source, /type:\s*"radio"/);
	assert.match(source, /aria-live/);
	assert.match(source, /pollStatus/);
});

test("audio sessions delegate painting and release every observed vessel", () => {
	const session = read("controllers/audioSession.js");
	const painter = read("controllers/audioSessionPainter.js");
	const bindings = read("controllers/audioSessionBindings.js");
	const controller = read("controllers/audioWaveformController.js");
	assert.match(session, /AudioSessionPainter/);
	assert.match(session, /bindAudioSession/);
	assert.match(session, /this\.canvas/);
	assert.match(session, /this\.unbind\(\)/);
	assert.match(painter, /requestAnimationFrame/);
	assert.match(painter, /cancelAnimationFrame/);
	assert.match(bindings, /removeEventListener/);
	assert.match(controller, /MutationObserver/);
	assert.match(controller, /ResizeObserver/);
	assert.match(controller, /IntersectionObserver/);
	assert.match(controller, /unobserve\(session\.canvas\)/);
});

test("source graph and modular audio remain understandable without WebGL", () => {
	const graph = read("renderers/sourceGraph.js");
	const audio = read("renderers/audio.js");
	const transport = read("renderers/audioTransport.js");
	const transcript = read("renderers/audioTranscript.js");
	assert.match(graph, /role:\s*"list"/);
	assert.match(graph, /relation/);
	assert.match(audio, /aria-label/);
	assert.match(transport, /audioSeek/);
	assert.match(transcript, /Transcript/);
	assert.match(transcript, /role:\s*"region"/);
});

test("cosmic feed imports stay local and modules stay focused", () => {
	for (const filePath of modules) {
		const source = readFileSync(filePath, "utf8");
		const lines = source.split(/\r?\n/);
		assert.ok(
			lines.length <= 120 || source.includes("cosmic-long-file-ok"),
			`${filePath} has ${lines.length} lines`
		);
		for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
			assert.ok(match[1].startsWith("."), `${filePath} imports external ${match[1]}`);
		}
	}
});

test("every cosmic feed source begins with the project blessing", () => {
	for (const filePath of modules) {
		const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
		assert.match(lines[0] || "", /B"H/, filePath);
		assert.match(lines[1] || "", /Boruch Hashem/, filePath);
		assert.match(lines[2] || "", /Blessed is He/, filePath);
	}
});

function collectModules(directory) {
	return readdirSync(directory).flatMap(name => {
		const filePath = path.join(directory, name);
		if (statSync(filePath).isDirectory()) {
			return collectModules(filePath);
		}
		return /\.(?:js|mjs)$/.test(filePath) ? [filePath] : [];
	});
}
