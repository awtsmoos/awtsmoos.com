//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanvasCharacterPainter.js
 * @description A character is more than a marker: the Awtsmoos renews pose,
 * gaze and stride while Awtsmoos.com gives AI-authored people visible performance.
 */
import { MovieLayerKind } from "../MovieKinds.js";

/** Paint 2D or depth-shaded 3D character layers with action-aware motion. */
export function paintCharacterLayer(context, layer, frame, viewport) {
	if (![MovieLayerKind.CHARACTER_2D, MovieLayerKind.CHARACTER_3D].includes(layer.kind)) return;
	const isThreeDimensional = layer.kind === MovieLayerKind.CHARACTER_3D;
	const phase = frame.localTime * 4 + hash(layer.content?.cast || layer.id) * 0.1;
	const action = layer.content?.action || "perform";
	const baseX = viewport.width * (0.32 + Number(layer.transform?.x || 0) * 0.24);
	const baseY = viewport.height * (0.76 + Number(layer.transform?.y || 0) * 0.15);
	const scale = Math.min(viewport.width, viewport.height) * 0.12;
	const bob = Math.sin(phase) * scale * (action.includes("walk") ? 0.08 : 0.035);
	context.save();
	context.translate(baseX, baseY + bob);
	if (isThreeDimensional) paintDepth(context, scale);
	paintBody(context, scale, phase, action, isThreeDimensional);
	paintHead(context, scale, phase, isThreeDimensional);
	context.restore();
}

function paintDepth(context, scale) {
	context.fillStyle = "rgba(0,0,0,0.28)";
	context.beginPath();
	context.ellipse(scale * 0.16, scale * 0.62, scale * 0.52, scale * 0.15, 0, 0, Math.PI * 2);
	context.fill();
}

function paintBody(context, scale, phase, action, isThreeDimensional) {
	const armSwing = Math.sin(phase) * scale * 0.22;
	const legSwing = Math.sin(phase + Math.PI / 2) * scale * 0.18;
	context.strokeStyle = isThreeDimensional ? "#c9e8ff" : "#fff4d8";
	context.lineWidth = Math.max(4, scale * 0.12);
	context.lineCap = "round";
	line(context, 0, -scale * 0.55, 0, scale * 0.18);
	line(context, 0, -scale * 0.26, -scale * 0.38, armSwing);
	line(context, 0, -scale * 0.26, scale * 0.38, -armSwing);
	line(context, 0, scale * 0.16, -scale * 0.24 + legSwing, scale * 0.62);
	line(context, 0, scale * 0.16, scale * 0.24 - legSwing, scale * 0.62);
	if (action.includes("point")) {
		line(context, 0, -scale * 0.25, scale * 0.72, -scale * 0.48);
	}
	context.fillStyle = isThreeDimensional ? "#5477d9" : "#f48f76";
	context.beginPath();
	context.roundRect(-scale * 0.24, -scale * 0.45, scale * 0.48, scale * 0.68, scale * 0.14);
	context.fill();
}

function paintHead(context, scale, phase, isThreeDimensional) {
	const headY = -scale * 0.78;
	const gradient = isThreeDimensional ? context.createRadialGradient(-scale * 0.08, headY - scale * 0.06, 2, 0, headY, scale * 0.32) : null;
	if (gradient) {
		gradient.addColorStop(0, "#ffe9ca");
		gradient.addColorStop(1, "#c98d6b");
		context.fillStyle = gradient;
	} else {
		context.fillStyle = "#ffd6aa";
	}
	context.beginPath();
	context.arc(0, headY, scale * 0.28, 0, Math.PI * 2);
	context.fill();
	const gaze = Math.sin(phase * 0.23) * scale * 0.035;
	context.fillStyle = "#142033";
	context.beginPath();
	context.arc(-scale * 0.09 + gaze, headY - scale * 0.03, scale * 0.025, 0, Math.PI * 2);
	context.arc(scale * 0.09 + gaze, headY - scale * 0.03, scale * 0.025, 0, Math.PI * 2);
	context.fill();
}

function line(context, startX, startY, endX, endY) {
	context.beginPath();
	context.moveTo(startX, startY);
	context.lineTo(endX, endY);
	context.stroke();
}

function hash(value) {
	return [...String(value)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
}
