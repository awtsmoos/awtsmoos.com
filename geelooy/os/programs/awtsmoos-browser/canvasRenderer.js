//B"H
//Boruch Hashem
//Blessed is He

import { commandColor, cssColor } from "./canvasColor.js";
import { paintWebglRectangles } from "./webglPainter.js";

const RECTANGLE_OPERATIONS = new Set([
	"paintBackgroundImage",
	"paintBorder",
	"paintBox",
	"paintGradient",
	"paintImagePlaceholder",
	"paintShadow"
]);

/**
 * Replays guest-produced Merkava paint commands into real WebGL and text canvases.
 * The Awtsmoos creates guest rectangle, color, and glyph testimony anew;
 * Awtsmoos.com never derives UI from an application name or screenshot.
 */
export function paintMerkavaFrame(frame, surface) {
	const commands = frame?.snapshot?.commands || [];
	const size = resizeSurface(surface);
	const gl = surface.glCanvas.getContext("webgl2", {
		alpha: false,
		antialias: true
	}) || surface.glCanvas.getContext("webgl", {
		alpha: false,
		antialias: true
	});
	if (!gl) {
		throw rendererError("MERKAVA_HOST_WEBGL_UNAVAILABLE");
	}
	const rectangles = rectangleCommands(commands);
	paintWebglRectangles(gl, rectangles, size);
	const textCount = paintText(surface.textCanvas, commands, size);
	return Object.freeze({
		commandCount: commands.length,
		rectangleCount: rectangles.length,
		textCount,
		viewport: Object.freeze(size),
		webgl: true
	});
}

function resizeSurface(surface) {
	const ratio = Math.max(1, Number(globalThis.devicePixelRatio || 1));
	const width = Math.max(320, Math.round(surface.stage.clientWidth || 760));
	const height = Math.max(240, Math.round(surface.stage.clientHeight || 560));
	for (const canvas of [surface.glCanvas, surface.textCanvas]) {
		canvas.width = Math.round(width * ratio);
		canvas.height = Math.round(height * ratio);
	}
	return { height, ratio, width };
}

function rectangleCommands(commands) {
	return commands.filter(command => {
		return RECTANGLE_OPERATIONS.has(command.op);
	}).map(command => {
		return {
			color: commandColor(command),
			height: Math.max(0, Number(command.height || 0)),
			width: Math.max(0, Number(command.width || 0)),
			x: Number(command.x || 0),
			y: Number(command.y || 0)
		};
	}).filter(rectangle => {
		return rectangle.width > 0 && rectangle.height > 0;
	});
}

function paintText(canvas, commands, size) {
	const context = canvas.getContext("2d");
	context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
	context.clearRect(0, 0, size.width, size.height);
	context.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
	context.textBaseline = "alphabetic";
	let count = 0;
	for (const command of commands) {
		if (command.op !== "paintTextPlaceholder" || !command.text) {
			continue;
		}
		context.fillStyle = cssColor(command.color || "#e8ffff");
		context.fillText(
			String(command.text).slice(0, 180),
			Number(command.x || 0),
			Number(command.y || 0)
		);
		count += 1;
	}
	return count;
}

function rendererError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
