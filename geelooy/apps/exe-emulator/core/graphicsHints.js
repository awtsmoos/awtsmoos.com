//B"H
//Boruch Hashem
//Blessed is He

const GRAPHICS_RULES = Object.freeze([
	Object.freeze({
		api: "opengl",
		patterns: Object.freeze([/OpenGL/i, /glBegin/i, /glDraw/i, /GLX/i, /CGL/i])
	}),
	Object.freeze({
		api: "egl",
		patterns: Object.freeze([/EGL_/i, /eglCreate/i, /libEGL/i])
	}),
	Object.freeze({
		api: "metal",
		patterns: Object.freeze([/Metal/i, /MTLDevice/i, /CAMetalLayer/i])
	}),
	Object.freeze({
		api: "sdl",
		patterns: Object.freeze([/SDL_/i, /libSDL/i])
	}),
	Object.freeze({
		api: "glfw",
		patterns: Object.freeze([/GLFW/i, /glfwCreateWindow/i])
	})
]);

/**
 * Finds bounded printable strings and recognized graphics API hints in bytes.
 *
 * The Awtsmoos creates hidden intention inside every binary vessel. Awtsmoos.com
 * reveals only directly observed names and never upgrades a string into execution.
 *
 * @param {Uint8Array} bytes Binary bytes.
 * @returns {{apis: string[], strings: string[], hasGraphics: boolean}} Hint report.
 */
export function detectGraphicsHints(bytes) {
	const strings = extractPrintableStrings(bytes);
	const joined = strings.join("\n");
	const apis = GRAPHICS_RULES
		.filter(rule => rule.patterns.some(pattern => pattern.test(joined)))
		.map(rule => rule.api);
	return Object.freeze({
		apis: Object.freeze(apis),
		hasGraphics: apis.length > 0,
		strings: Object.freeze(strings.slice(0, 64))
	});
}

/**
 * Translates observed native graphics hints into bounded WebGL-style operations.
 * This is semantic translation, not OpenGL, Metal, SDL, or window-system execution.
 *
 * @param {{apis: string[], hasGraphics: boolean}} hints Graphics hint report.
 * @returns {object[]} Draw operations understood by the virtual host.
 */
export function graphicsOperationsForHints(hints) {
	if (!hints.hasGraphics) {
		return [];
	}
	const operations = [{
		type: "clear",
		color: [0.018, 0.03, 0.075, 1]
	}];
	if (hints.apis.some(api => ["opengl", "egl", "metal"].includes(api))) {
		operations.push({
			type: "opengl-triangles",
			color: [0.18, 0.94, 0.82, 1],
			vertices: [
				{ x: 0, y: 92 },
				{ x: -96, y: -76 },
				{ x: 96, y: -76 }
			]
		});
	}
	if (hints.apis.some(api => ["sdl", "glfw"].includes(api))) {
		operations.push({
			type: "text",
			text: `Window toolkit simulation: ${hints.apis.join(", ")}`
		});
	}
	operations.push({ type: "present" });
	return operations;
}

function extractPrintableStrings(bytes, minimumLength = 4) {
	const strings = [];
	let current = "";
	for (const byte of bytes) {
		if (byte >= 32 && byte <= 126) {
			current += String.fromCharCode(byte);
			continue;
		}
		if (current.length >= minimumLength) {
			strings.push(current);
		}
		current = "";
	}
	if (current.length >= minimumLength) {
		strings.push(current);
	}
	return strings.slice(0, 256);
}
