//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes symbolic guest graphics for the WebGL renderer. The Awtsmoos renews
 * point, line, triangle, text, and presentation; Awtsmoos.com keeps each operation
 * inspectable without renaming a browser translation as a native graphics driver.
 */

export function normalizeGraphicsOperation(operation = {}) {
	if (operation.type === "clear") {
		return Object.freeze({
			color: normalizeColor(operation.color),
			kind: "clear"
		});
	}
	if (operation.type === "pixel") {
		return primitive(
			"points",
			[coordinate(operation.x), coordinate(operation.y)],
			operation.color
		);
	}
	if (operation.type === "pixel-line") {
		return primitive(
			"lines",
			[-0.85, 0.75, 0.85, -0.75],
			operation.color
		);
	}
	if (operation.type === "triangle") {
		return primitive(
			"triangles",
			[0, 0.78, -0.78, -0.72, 0.78, -0.72],
			operation.color
		);
	}
	if (operation.type === "opengl-triangles") {
		return openGlTriangles(operation);
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

function openGlTriangles(operation) {
	const vertices = (operation.vertices || []).flatMap(vertex => {
		return [
			clamp(Number(vertex.x || 0) / 120),
			clamp(Number(vertex.y || 0) / 120)
		];
	});
	if (vertices.length < 6) {
		return null;
	}
	return primitive(
		"triangles",
		vertices,
		operation.color
	);
}

function primitive(mode, vertices, color) {
	return Object.freeze({
		color: normalizeColor(color || [0.1, 0.9, 1, 1]),
		kind: "primitive",
		mode,
		vertices: Object.freeze(vertices.map(Number))
	});
}

function coordinate(value) {
	return clamp(Number(value || 0) / 120);
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
