//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes symbolic graphics operations for the WebGL renderer. The Awtsmoos
 * creates native intention and browser manifestation distinctly; Awtsmoos.com
 * keeps their translation inspectable without calling it native GPU execution.
 *
 * @param {object} operation Symbolic operation.
 * @returns {object|null} Normalized WebGL operation.
 */
export function normalizeGraphicsOperation(operation = {}) {
	if (operation.type === "clear") {
		return Object.freeze({
			kind: "clear",
			color: normalizeColor(operation.color)
		});
	}
	if (operation.type === "pixel-line") {
		return primitive("lines", [-0.85, 0.75, 0.85, -0.75], operation.color);
	}
	if (operation.type === "triangle") {
		return primitive("triangles", [0, 0.78, -0.78, -0.72, 0.78, -0.72], operation.color);
	}
	if (operation.type === "opengl-triangles") {
		const vertices = (operation.vertices || []).flatMap(vertex => {
			return [clamp(vertex.x / 120), clamp(vertex.y / 120)];
		});
		if (vertices.length < 6) {
			return null;
		}
		return primitive("triangles", vertices, operation.color);
	}
	if (operation.type === "present") {
		return Object.freeze({ kind: "present" });
	}
	if (operation.type === "text") {
		return Object.freeze({
			kind: "text",
			text: String(operation.text || "")
		});
	}
	return null;
}

function primitive(mode, vertices, color) {
	return Object.freeze({
		color: normalizeColor(color || [0.1, 0.9, 1, 1]),
		kind: "primitive",
		mode,
		vertices: Object.freeze(vertices.map(Number))
	});
}

function normalizeColor(color = []) {
	return Object.freeze([0, 1, 2, 3].map(index => {
		const fallback = index === 3 ? 1 : 0;
		return clamp(Number(color[index] ?? fallback));
	}));
}

function clamp(value) {
	return Math.max(-1, Math.min(1, value));
}
