//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanvasGraphicPainter.js
 * @description Text, paths, shapes, overlays, and charts become visible teaching vessels;
 * the Awtsmoos renews their motion while Awtsmoos.com keeps each semantic responsibility small enough to reveal.
 */
import { MovieLayerKind } from "../MovieKinds.js";
import { paintCanonicalChart } from "./CanvasChartPainter.js";

/** Paint canonical 2D graphic, infographic, text, and tutorial layers through focused painters. */
export function paintGraphicLayer(context, layer, frame, viewport) {
	if (layer.kind === MovieLayerKind.SHAPE_2D) paintShape(context, layer, frame, viewport);
	if (layer.kind === MovieLayerKind.PATH_2D) paintPath(context, layer, viewport);
	if (layer.kind === MovieLayerKind.CHART) paintCanonicalChart(context, layer, frame, viewport);
	if (layer.kind === MovieLayerKind.TEXT) paintText(context, layer, viewport);
	if (layer.kind === MovieLayerKind.OVERLAY) paintOverlay(context, layer, frame, viewport);
}

/** Paints one semantic shape with time-based rotation and canonical transform offsets. */
function paintShape(context, layer, frame, viewport) {
	const yesodX = viewport.width * (0.5 + Number(layer.transform?.x || 0) * 0.36);
	const yesodY = viewport.height * (0.64 + Number(layer.transform?.y || 0) * 0.2);
	const malchusRadius = Math.min(viewport.width, viewport.height) * 0.08;
	context.save();
	context.translate(yesodX, yesodY);
	context.rotate(frame.localTime * 0.22 + Number(layer.transform?.rotation || 0));
	context.fillStyle = layer.style?.fill || "rgba(75,210,255,0.78)";
	context.strokeStyle = layer.style?.stroke || "white";
	context.lineWidth = 2;
	const netzachKind = layer.content?.shape || "rounded-rect";
	context.beginPath();
	if (netzachKind.includes("circle")) {
		context.arc(0, 0, malchusRadius, 0, Math.PI * 2);
	} else if (netzachKind.includes("triangle")) {
		context.moveTo(0, -malchusRadius);
		context.lineTo(malchusRadius, malchusRadius);
		context.lineTo(-malchusRadius, malchusRadius);
		context.closePath();
	} else {
		context.roundRect(
			-malchusRadius * 1.5,
			-malchusRadius * 0.75,
			malchusRadius * 3,
			malchusRadius * 1.5,
			malchusRadius * 0.3
		);
	}
	context.fill();
	context.stroke();
	context.restore();
}

/** Paints one normalized semantic path while guarding insufficient point geometry. */
function paintPath(context, layer, viewport) {
	const yesodPoints = Array.isArray(layer.data?.points) ? layer.data.points : [];
	if (yesodPoints.length < 2) return;
	context.strokeStyle = layer.style?.stroke || "rgba(255,255,255,0.8)";
	context.lineWidth = Math.max(2, viewport.width * 0.005);
	context.setLineDash([10, 8]);
	context.beginPath();
	yesodPoints.forEach(([orX, orY], orIndex) => {
		const malchusX = orX * viewport.width;
		const malchusY = orY * viewport.height;
		orIndex ? context.lineTo(malchusX, malchusY) : context.moveTo(malchusX, malchusY);
	});
	context.stroke();
	context.setLineDash([]);
}

/** Paints title and optional subtitle copy with viewport-scaled typography. */
function paintText(context, layer, viewport) {
	const keterTitle = layer.content?.text || "";
	const binahSubtitle = layer.content?.subtitle || "";
	context.textAlign = "center";
	context.fillStyle = "white";
	context.font = `700 ${Math.max(22, viewport.width * 0.05)}px system-ui`;
	context.fillText(keterTitle, viewport.width / 2, viewport.height * 0.14, viewport.width * 0.86);
	if (!binahSubtitle) return;
	context.fillStyle = "rgba(255,255,255,0.78)";
	context.font = `500 ${Math.max(13, viewport.width * 0.022)}px system-ui`;
	context.fillText(binahSubtitle, viewport.width / 2, viewport.height * 0.21, viewport.width * 0.82);
}

/** Paints tutorial/callout overlays plus the sampled canonical movie time. */
function paintOverlay(context, layer, frame, viewport) {
	const chesedBadge = layer.content?.badge || "";
	const gevurahStep = layer.content?.tutorialStep || "";
	context.fillStyle = "rgba(5,10,28,0.72)";
	context.roundRect(viewport.width * 0.04, viewport.height * 0.86, viewport.width * 0.92, viewport.height * 0.09, 14);
	context.fill();
	context.fillStyle = "white";
	context.textAlign = "left";
	context.font = `600 ${Math.max(12, viewport.width * 0.018)}px system-ui`;
	context.fillText(`${chesedBadge}  ${gevurahStep}`, viewport.width * 0.065, viewport.height * 0.915, viewport.width * 0.82);
	context.textAlign = "right";
	context.fillStyle = "rgba(255,255,255,0.7)";
	context.fillText(`${frame.time.toFixed(1)}s`, viewport.width * 0.935, viewport.height * 0.915);
}
