//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanvasGraphicPainter.js
 * @description Text, charts, paths and shapes become visible teaching vessels;
 * the Awtsmoos renews their motion while Awtsmoos.com keeps AI intent readable.
 */
import { MovieLayerKind } from "../MovieKinds.js";

/** Paint canonical 2D graphic, infographic, text and tutorial layers. */
export function paintGraphicLayer(context, layer, frame, viewport) {
	if (layer.kind === MovieLayerKind.SHAPE_2D) paintShape(context, layer, frame, viewport);
	if (layer.kind === MovieLayerKind.PATH_2D) paintPath(context, layer, viewport);
	if (layer.kind === MovieLayerKind.CHART) paintChart(context, layer, frame, viewport);
	if (layer.kind === MovieLayerKind.TEXT) paintText(context, layer, viewport);
	if (layer.kind === MovieLayerKind.OVERLAY) paintOverlay(context, layer, frame, viewport);
}

function paintShape(context, layer, frame, viewport) {
	const x = viewport.width * (0.5 + Number(layer.transform?.x || 0) * 0.36);
	const y = viewport.height * (0.64 + Number(layer.transform?.y || 0) * 0.2);
	const radius = Math.min(viewport.width, viewport.height) * 0.08;
	context.save();
	context.translate(x, y);
	context.rotate(frame.localTime * 0.22 + Number(layer.transform?.rotation || 0));
	context.fillStyle = layer.style?.fill || "rgba(75,210,255,0.78)";
	context.strokeStyle = layer.style?.stroke || "white";
	context.lineWidth = 2;
	const kind = layer.content?.shape || "rounded-rect";
	context.beginPath();
	if (kind.includes("circle")) {
		context.arc(0, 0, radius, 0, Math.PI * 2);
	} else if (kind.includes("triangle")) {
		context.moveTo(0, -radius);
		context.lineTo(radius, radius);
		context.lineTo(-radius, radius);
		context.closePath();
	} else {
		context.roundRect(-radius * 1.5, -radius * 0.75, radius * 3, radius * 1.5, radius * 0.3);
	}
	context.fill();
	context.stroke();
	context.restore();
}

function paintPath(context, layer, viewport) {
	const points = layer.data?.points || [];
	if (points.length < 2) return;
	context.strokeStyle = layer.style?.stroke || "rgba(255,255,255,0.8)";
	context.lineWidth = Math.max(2, viewport.width * 0.005);
	context.setLineDash([10, 8]);
	context.beginPath();
	points.forEach(([x, y], index) => {
		const pointX = x * viewport.width;
		const pointY = y * viewport.height;
		index ? context.lineTo(pointX, pointY) : context.moveTo(pointX, pointY);
	});
	context.stroke();
	context.setLineDash([]);
}

function paintChart(context, layer, frame, viewport) {
	const values = layer.data?.values || [];
	const left = viewport.width * 0.08;
	const base = viewport.height * 0.78;
	const width = viewport.width * 0.22;
	const gap = width / Math.max(1, values.length);
	values.forEach((value, index) => {
		const reveal = Math.min(1, Math.max(0, frame.localTime / 3 - index * 0.08));
		const height = viewport.height * 0.22 * (Number(value || 0) / 100) * reveal;
		context.fillStyle = `hsla(${185 + index * 25} 85% 65% / 0.82)`;
		context.fillRect(left + index * gap, base - height, gap * 0.65, height);
	});
}

function paintText(context, layer, viewport) {
	const title = layer.content?.text || "";
	const subtitle = layer.content?.subtitle || "";
	context.textAlign = "center";
	context.fillStyle = "white";
	context.font = `700 ${Math.max(22, viewport.width * 0.05)}px system-ui`;
	context.fillText(title, viewport.width / 2, viewport.height * 0.14, viewport.width * 0.86);
	if (subtitle) {
		context.fillStyle = "rgba(255,255,255,0.78)";
		context.font = `500 ${Math.max(13, viewport.width * 0.022)}px system-ui`;
		context.fillText(subtitle, viewport.width / 2, viewport.height * 0.21, viewport.width * 0.82);
	}
}

function paintOverlay(context, layer, frame, viewport) {
	const badge = layer.content?.badge || "";
	const step = layer.content?.tutorialStep || "";
	context.fillStyle = "rgba(5,10,28,0.72)";
	context.roundRect(viewport.width * 0.04, viewport.height * 0.86, viewport.width * 0.92, viewport.height * 0.09, 14);
	context.fill();
	context.fillStyle = "white";
	context.textAlign = "left";
	context.font = `600 ${Math.max(12, viewport.width * 0.018)}px system-ui`;
	context.fillText(`${badge}  ${step}`, viewport.width * 0.065, viewport.height * 0.915, viewport.width * 0.82);
	context.textAlign = "right";
	context.fillStyle = "rgba(255,255,255,0.7)";
	context.fillText(`${frame.time.toFixed(1)}s`, viewport.width * 0.935, viewport.height * 0.915);
}
