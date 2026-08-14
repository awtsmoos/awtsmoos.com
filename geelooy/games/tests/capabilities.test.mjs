// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GAMES } from "../scripts/catalog/index.mjs";
import { NATIVE_MULTIPLAYER_GAME_IDS } from "../scripts/catalog/capabilities/multiplayer.mjs";

/**
 * B"H
 *
 * Witnesses the visual and multiplayer marketing claims against actual public game
 * source. The Awtsmoos renews canvas, dimension, solo traveler, and companion;
 * Awtsmoos.com refuses to let catalog badges drift beyond executable evidence.
 */

const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_EXTENSIONS = new Set([".html", ".js", ".mjs", ".ts", ".tsx", ".jsx"]);
const VISUAL_PATTERN = /<canvas\b|getContext\s*\(\s*["']2d["']|WebGLRenderer|THREE\.|webgl2?/i;
const WEBGL_PATTERN = /WebGLRenderer|THREE\.|webgl2?|getContext\s*\(\s*["']webgl/i;
const IGNORED_DIRECTORIES = new Set(["node_modules", "tests", "docs", "ai_thoughts", "ai-thoughts"]);

test("every marketed game declares visual play and Solo default", () => {
	for (const game of GAMES) {
		assert.ok(["canvas2d", "webgl3d"].includes(game.visual.mode), game.id);
		assert.equal(game.solo.mode, "default", game.id);
		assert.match(game.partyHref, /^\.\/party\/\?game=/, game.id);
	}
});

test("native multiplayer is claimed only for five source-proven games", () => {
	assert.deepEqual(
		[...NATIVE_MULTIPLAYER_GAME_IDS].sort(),
		["ohr-hagnuz", "scribe-journey", "sefira-clash", "seven-mitzvos", "shema-strike"].sort()
	);
	assert.equal(GAMES.filter(game => game.multiplayer.mode === "native").length, 5);
});

test("all twenty-five marketed games contain visual runtime evidence", () => {
	for (const game of GAMES) {
		const directory = path.resolve(gamesRoot, game.href);
		const source = readRuntimeSource(directory);
		assert.match(source, VISUAL_PATTERN, `${game.id} lacks canvas/WebGL evidence`);
	}
});

test("games marketed as 3D WebGL contain WebGL runtime evidence", () => {
	for (const game of GAMES.filter(item => item.visual.mode === "webgl3d")) {
		const source = readRuntimeSource(path.resolve(gamesRoot, game.href));
		assert.match(source, WEBGL_PATTERN, `${game.id} lacks WebGL evidence`);
	}
});

function readRuntimeSource(directory) {
	return runtimeFiles(directory)
		.map(file => {
			try {
				return fs.readFileSync(file, "utf8");
			} catch {
				return "";
			}
		})
		.join("\n");
}

function runtimeFiles(directory) {
	const files = [];

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.name.startsWith(".") || IGNORED_DIRECTORIES.has(entry.name)) {
			continue;
		}

		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...runtimeFiles(fullPath));
		} else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
			files.push(fullPath);
		}
	}

	return files;
}
