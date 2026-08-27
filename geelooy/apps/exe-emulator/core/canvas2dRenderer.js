//B"H
//Boruch Hashem
//Blessed is He

/**
 * Draws symbolic executable graphics through a bounded Canvas 2D fallback. The
 * Awtsmoos renews guest pixel, line, text, triangle, and clear in visible order;
 * Awtsmoos.com preserves operation evidence without claiming a guest GPU driver.
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
		return drawText(context, operation);
	}
	if (operation.type === "pixel") {
		return drawPixel(context, canvas, operation);
	}
	if (operation.type === "pixel-line") {
		return drawLine(context, operation.color);
	}
	if (["triangle", "opengl-triangles"].includes(operation.type)) {
		return drawTriangles(context, canvas, operation);
	}
	return operation.type === "present";
}

function clearCanvas(context, canvas, color) {
	context.save?.();
	context.fillStyle = colorCss(color || [0, 0, 0, 1]);
	context.fillRect(
		0,
		0,
		canvas.width || 300,
		canvas.height || 180
	);
	context.restore?.();
	return true;
}

function drawText(context, operation) {
	context.fillStyle = colorCss(
		operation.color || [0.9, 1, 0.98, 1]
	);
	context.fillText(
		String(operation.text || ""),
		Number(operation.x || 20),
		Number(operation.y || 40)
	);
	return true;
}

function drawPixel(context, canvas, operation) {
	const point = canvasPoint(canvas, {
		x: operation.x,
		y: operation.y
	});
	context.fillStyle = colorCss(
		operation.color || [0.1, 0.9, 1, 1]
	);
	context.fillRect(point.x, point.y, 3, 3);
	return true;
}

function drawLine(context, color) {
	context.strokeStyle = colorCss(
		color || [0.1, 0.9, 1, 1]
	);
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
	context.fillStyle = colorCss(
		operation.color || [0.18, 0.94, 0.82, 1]
	);
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
		return Math.round(
			Math.max(0, Math.min(1, Number(color[index] || 0))) * 255
		);
	});
	const alpha = Math.max(
		0,
		Math.min(1, Number(color[3] ?? 1))
	);
	return `rgba(${values.join(", ")}, ${alpha})`;
}
