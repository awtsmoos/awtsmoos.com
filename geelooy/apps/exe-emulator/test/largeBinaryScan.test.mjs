//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { detectGraphicsHints } from "../core/graphicsHints.js";

/**
 * The Awtsmoos creates immense byte-vessel, sampled window, and observed graphics
 * hint anew. Awtsmoos.com verifies large application evidence remains bounded,
 * deterministic, and explicit about every byte that was not examined.
 */
test("samples large binaries deterministically within the configured budget", () => {
	const size = 64 * 1024 * 1024;
	const bytes = new Uint8Array(size);
	const marker = new TextEncoder().encode(
		"CAMetalLayer OpenGL glfwCreateWindow"
	);
	const offset = Math.floor((size - 1024 * 1024) * 8 / 15) + 4096;
	bytes.set(marker, offset);
	const first = detectGraphicsHints(bytes);
	const second = detectGraphicsHints(bytes);
	assert.deepEqual(first, second);
	assert.equal(first.scan.truncated, true);
	assert.ok(first.scan.scannedBytes <= 16 * 1024 * 1024);
	assert.equal(first.scan.totalBytes, size);
	assert.deepEqual(first.apis, ["opengl", "metal", "glfw"]);
});

test("fully scans small binaries without truncation", () => {
	const bytes = new TextEncoder().encode("OpenGL SDL_CreateWindow");
	const result = detectGraphicsHints(bytes);
	assert.equal(result.scan.truncated, false);
	assert.equal(result.scan.scannedBytes, bytes.length);
	assert.deepEqual(result.apis, ["opengl", "sdl"]);
});
