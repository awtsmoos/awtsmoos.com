//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanvasWorldPainter.js
 * @description Depth is painted as a humble vessel: the Awtsmoos renews horizon,
 * light and form while Awtsmoos.com makes camera intention visibly testable.
 */
import { MovieLayerKind } from "../MovieKinds.js";

/** Paint world, light and model layers with perspective-aware canvas geometry. */
export function paintWorldLayer(context, layer, frame, viewport) {
	if (layer.kind === MovieLayerKind.WORLD_3D) {
		paintWorld(context, layer, frame, viewport);
	}
	if (layer.kind === MovieLayerKind.LIGHT_3D) {
		paintLight(context, layer, frame, viewport);
	}
	if (layer.kind === MovieLayerKind.MODEL_3D) {
		paintModel(context, layer, frame, viewport);
	}
}

function paintWorld(context, layer, frame, viewport) {
	const hue = hashHue(layer.content?.theme || frame.scene?.name || "world");
	const gradient = context.createLinearGradient(0, 0, 0, viewport.height);
	gradient.addColorStop(0, `hsl(${hue} 62% 15%)`);
	gradient.addColorStop(0.58, `hsl(${(hue + 48) % 360} 58% 28%)`);
	gradient.addColorStop(1, `hsl(${(hue + 110) % 360} 45% 9%)`);
	context.fillStyle = gradient;
	context.fillRect(0, 0, viewport.width, viewport.height);
	paintPerspectiveGrid(context, frame, viewport, hue);
}

function paintPerspectiveGrid(context, frame, viewport, hue) {
	const camera = frame.scene?.camera?.kind || "wide";
	const horizon = viewport.height * horizonRatio(camera);
	const vanishingX = viewport.width * (0.5 + Math.sin(frame.localTime * 0.3) * 0.06);
	context.strokeStyle = `hsla(${(hue + 80) % 360} 90% 80% / 0.22)`;
	context.lineWidth = 1;
	for (let index = -7; index <= 7; index += 1) {
		context.beginPath();
		context.moveTo(vanishingX, horizon);
		context.lineTo(viewport.width * (0.5 + index * 0.13), viewport.height);
		context.stroke();
	}
	for (let step = 1; step <= 8; step += 1) {
		const ratio = step / 8;
		const y = horizon + (viewport.height - horizon) * ratio * ratio;
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(viewport.width, y);
		context.stroke();
	}
}

function paintLight(context, layer, frame, viewport) {
	const x = viewport.width * (0.18 + 0.64 * ((Math.sin(frame.localTime * 0.5) + 1) / 2));
	const y = viewport.height * 0.24;
	const glow = context.createRadialGradient(x, y, 2, x, y, viewport.width * 0.34);
	glow.addColorStop(0, "rgba(255,248,205,0.58)");
	glow.addColorStop(1, "rgba(255,248,205,0)");
	context.fillStyle = glow;
	context.fillRect(0, 0, viewport.width, viewport.height);
}

function paintModel(context, layer, frame, viewport) {
	const rotation = Number(layer.transform?.rotation || frame.localTime * 0.7);
	const centerX = viewport.width * (0.72 + Number(layer.transform?.x || 0) * 0.16);
	const centerY = viewport.height * (0.54 + Number(layer.transform?.y || 0) * 0.18);
	const size = Math.min(viewport.width, viewport.height) * 0.16;
	const depthX = Math.cos(rotation) * size * 0.5;
	const depthY = Math.sin(rotation) * size * 0.28;
	context.fillStyle = "rgba(125,220,255,0.72)";
	context.fillRect(centerX - size / 2, centerY - size / 2, size, size);
	context.fillStyle = "rgba(71,91,210,0.72)";
	polygon(context, [[centerX + size / 2, centerY - size / 2], [centerX + size / 2 + depthX, centerY - size / 2 - depthY], [centerX + size / 2 + depthX, centerY + size / 2 - depthY], [centerX + size / 2, centerY + size / 2]]);
	context.fillStyle = "rgba(196,242,255,0.78)";
	polygon(context, [[centerX - size / 2, centerY - size / 2], [centerX - size / 2 + depthX, centerY - size / 2 - depthY], [centerX + size / 2 + depthX, centerY - size / 2 - depthY], [centerX + size / 2, centerY - size / 2]]);
}

function polygon(context, points) {
	context.beginPath();
	points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
	context.closePath();
	context.fill();
}

function horizonRatio(camera) {
	if (camera === "low-angle") return 0.7;
	if (camera === "high-angle" || camera === "overhead") return 0.28;
	if (camera === "closeup" || camera === "extreme-closeup") return 0.48;
	return 0.52;
}

function hashHue(value) {
	return [...String(value)].reduce((sum, character) => sum + character.charCodeAt(0) * 13, 0) % 360;
}
