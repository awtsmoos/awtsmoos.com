//B"H
//Boruch Hashem
//Blessed is He

/**
 * Draws symbolic executable graphics through a bounded Canvas 2D fallback.
 *
 * The Awtsmoos creates native graphical intention and browser fallback anew.
 * Awtsmoos.com preserves the operation shape when WebGL is absent without
 * pretending Canvas 2D is an OpenGL, Metal, GDI, or guest-driver implementation.
 *
 * @param {HTMLCanvasElement} canvas Drawing target.
 * @param {object} operation Symbolic graphics operation.
 * @returns {boolean} Whether the operation was represented.
 */
export function drawCanvas2d(canvas, operation = {}) {
	const context = canvas?.getContext?.("2d");
	if (!context) {
		return false;
	}
	if (operation.type === "clear") {
		return clearCanvas(context, canvas, operation.color);
	}
	if (operation.type === "text") {
		context.fillStyle = colorCss(operation.color || [0.9, 1, 0.98, 1]);
		context.fillText(String(operation.text || ""), operation.x || 20, operation.y || 40);
		return true;
	}
	if (operation.type === "pixel-line") {
		return drawLine(context, operation.color);
	}
	if (["triangle", "opengl-triangles"].includes(operation.type)) {
		return drawTriangles(context, canvas, operation);
	}
	if (operation.type === "present") {
		return true;
	}
	return false;
}

function clearCanvas(context, canvas, color) {
	context.save?.();
	context.fillStyle = colorCss(color || [0, 0, 0, 1]);
	context.fillRect(0, 0, canvas.width || 300, canvas.height || 180);
	context.restore?.();
	return true;
}

function drawLine(context, color) {
	context.strokeStyle = colorCss(color || [0.1, 0.9, 1, 1]);
	context.beginPath();
	context.moveTo(20, 20);
	context.lineTo(220, 160);
	context.stroke();
	return true;
}

function drawTriangles(context, canvas, operation) {
	const vertices = operation.type === "opengl-triangles"
		? operation.vertices || []
		: [
			{ x: 0, y: 90 },
			{ x: -100, y: -75 },
			{ x: 100, y: -75 }
		];
	if (vertices.length < 3) {
		return false;
	}
	context.fillStyle = colorCss(operation.color || [0.18, 0.94, 0.82, 1]);
	context.beginPath();
	vertices.forEach((vertex, index) => {
		const point = canvasPoint(canvas, vertex);
		if (index === 0) {
			context.moveTo(point.x, point.y);
		} else {
			context.lineTo(point.x, point.y);
		}
	});
	context.closePath();
	context.fill();
	return true;
}

function canvasPoint(canvas, vertex) {
	const width = canvas.width || 300;
	const height = canvas.height || 180;
	return {
		x: width / 2 + Number(vertex.x || 0),
		y: height / 2 - Number(vertex.y || 0)
	};
}

function colorCss(color) {
	const values = [0, 1, 2].map(index => {
		return Math.round(Math.max(0, Math.min(1, Number(color[index] || 0))) * 255);
	});
	const alpha = Math.max(0, Math.min(1, Number(color[3] ?? 1)));
	return `rgba(${values.join(", ")}, ${alpha})`;
}
