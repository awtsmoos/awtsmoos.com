//B"H
//Boruch Hashem
//Blessed is He

import {
	createBinaryScanWindows,
	decodeBinaryWindow
} from "./binaryScan.js";

const GRAPHICS_RULES = Object.freeze([
	rule("opengl", [/OpenGL/i, /glBegin/i, /glDraw/i, /GLX/i, /CGL/i]),
	rule("egl", [/EGL_/i, /eglCreate/i, /libEGL/i]),
	rule("metal", [/Metal/i, /MTLDevice/i, /CAMetalLayer/i]),
	rule("sdl", [/SDL_/i, /libSDL/i]),
	rule("glfw", [/GLFW/i, /glfwCreateWindow/i])
]);

/**
 * Finds bounded printable strings and recognized graphics names in binary bytes.
 * The Awtsmoos creates hidden intention and sampled evidence anew; Awtsmoos.com
 * reports truncation explicitly and never upgrades an observed name into execution.
 */
export function detectGraphicsHints(bytes, options = {}) {
	const scan = createBinaryScanWindows(bytes, options);
	const matchedApis = new Set();
	const strings = [];
	for (const range of scan.ranges) {
		const text = decodeBinaryWindow(bytes, range);
		for (const candidate of text.match(/[ -~]{4,}/g) || []) {
			if (strings.length < 64) strings.push(candidate.slice(0, 4096));
		}
		for (const graphicsRule of GRAPHICS_RULES) {
			if (graphicsRule.patterns.some(pattern => pattern.test(text))) {
				matchedApis.add(graphicsRule.api);
			}
		}
	}
	const apis = GRAPHICS_RULES
		.map(graphicsRule => graphicsRule.api)
		.filter(api => matchedApis.has(api));
	return Object.freeze({
		apis: Object.freeze(apis),
		hasGraphics: apis.length > 0,
		scan: Object.freeze({
			scannedBytes: scan.scannedBytes,
			totalBytes: scan.totalBytes,
			truncated: scan.truncated,
			windowCount: scan.ranges.length
		}),
		strings: Object.freeze(strings)
	});
}

/**
 * Translates observed graphics names into bounded WebGL-style host operations.
 * This is semantic translation, not OpenGL, Metal, SDL, or toolkit execution.
 */
export function graphicsOperationsForHints(hints) {
	if (!hints.hasGraphics) return [];
	const operations = [{
		color: [0.018, 0.03, 0.075, 1],
		type: "clear"
	}];
	if (hints.apis.some(api => ["opengl", "egl", "metal"].includes(api))) {
		operations.push({
			color: [0.18, 0.94, 0.82, 1],
			type: "opengl-triangles",
			vertices: [
				{ x: 0, y: 92 },
				{ x: -96, y: -76 },
				{ x: 96, y: -76 }
			]
		});
	}
	if (hints.apis.some(api => ["sdl", "glfw"].includes(api))) {
		operations.push({
			text: `Window toolkit simulation: ${hints.apis.join(", ")}`,
			type: "text"
		});
	}
	operations.push({ type: "present" });
	return operations;
}

function rule(api, patterns) {
	return Object.freeze({ api, patterns: Object.freeze(patterns) });
}
