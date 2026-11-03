//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PhotoCompositor.js
 * @description Photographs become cinema through measured drift, shadow, blend, and grade;
 * Awtsmoos.com paints the 2D photo mode from the shared render graph, and a missing photo is a labelled placeholder, never a silent blank.
 */
import { MovieLayerKind } from "../MovieKinds.js";
import { paintWorldLayer } from "./CanvasWorldPainter.js";
import { paintGraphicLayer } from "./CanvasGraphicPainter.js";
import { paintCharacterLayer } from "./CanvasCharacterPainter.js";
import { paintParticleLayer } from "./CanvasParticlePainter.js";
import { applyCinematicGrade } from "./CinematicGrade.js";
import { resolveLayerImageSource } from "../render/RenderGraph.js";
import { PhotoImageCache, sharedPhotoImageCache } from "./PhotoImageCache.js";

const WORLD_KINDS = new Set([
	MovieLayerKind.WORLD_3D,
	MovieLayerKind.LIGHT_3D,
	MovieLayerKind.MODEL_3D
]);

const TEXT_BAND_KINDS = new Set([
	MovieLayerKind.CAPTION,
	MovieLayerKind.DIALOGUE
]);

const BLEND_MODES = new Set([
	"source-over", "multiply", "screen", "overlay", "darken", "lighten",
	"color-dodge", "color-burn", "hard-light", "soft-light", "difference",
	"exclusion", "hue", "saturation", "color", "luminosity"
]);

/** Canvas2D compositor for the photo mode: plates, placed images, overlays, captions, grade. */
export class PhotoCompositor {
	constructor(orOptions = {}) {
		this.imageCache = orOptions.imageCache || sharedPhotoImageCache;
		this.lastWarnings = [];
	}

	/**
	 * Paint one sampled frame according to its frame plan.
	 * Returns the warnings raised while painting (missing or failed photographs).
	 */
	paint(orContext, orMovie, orFramePlan, orFrame, orViewport) {
		const keliWarnings = [];
		this.paintBackground(orContext, orMovie, orFramePlan, orFrame, orViewport, keliWarnings);
		const keliLayers = orFrame.layers || [];
		const keliWorldPaintedAsBackground = orFramePlan.background?.kind === "world";
		for (const keliLayer of keliLayers) {
			if (!WORLD_KINDS.has(keliLayer.kind)) continue;
			if (keliWorldPaintedAsBackground && keliLayer.kind === MovieLayerKind.WORLD_3D) continue;
			paintWorldLayer(orContext, keliLayer, orFrame, orViewport);
		}
		for (const keliLayer of keliLayers) {
			if (WORLD_KINDS.has(keliLayer.kind) || TEXT_BAND_KINDS.has(keliLayer.kind)) continue;
			if (keliLayer.kind === MovieLayerKind.IMAGE) {
				this.paintImageLayer(orContext, orMovie, keliLayer, orFramePlan, orViewport, keliWarnings);
				continue;
			}
			paintGraphicLayer(orContext, keliLayer, orFrame, orViewport);
			paintParticleLayer(orContext, keliLayer, orFrame, orViewport);
			paintCharacterLayer(orContext, keliLayer, orFrame, orViewport);
		}
		for (const keliLayer of keliLayers) {
			if (TEXT_BAND_KINDS.has(keliLayer.kind)) {
				paintTextBand(orContext, keliLayer, orViewport);
			}
		}
		applyCinematicGrade(orContext, orViewport, orFramePlan.grade, orFramePlan.frameIndex || 0);
		this.lastWarnings = keliWarnings;
		return keliWarnings;
	}

	paintBackground(orContext, orMovie, orFramePlan, orFrame, orViewport, orWarnings) {
		const { width, height } = orViewport;
		const keliBackground = orFramePlan.background || { kind: "color", color: "#070b18" };
		if (keliBackground.kind === "image") {
			this.paintPlate(orContext, keliBackground.src, orFramePlan, orViewport, orWarnings, null);
			return;
		}
		if (keliBackground.kind === "gradient") {
			const keliGradient = orContext.createLinearGradient(0, 0, 0, height);
			keliGradient.addColorStop(0, keliBackground.stops[0]);
			keliGradient.addColorStop(1, keliBackground.stops[1]);
			orContext.fillStyle = keliGradient;
			orContext.fillRect(0, 0, width, height);
			return;
		}
		if (keliBackground.kind === "world") {
			orContext.fillStyle = "#0a1020";
			orContext.fillRect(0, 0, width, height);
			for (const keliLayer of orFrame.layers || []) {
				if (keliLayer.kind === MovieLayerKind.WORLD_3D) {
					paintWorldLayer(orContext, keliLayer, orFrame, orViewport);
				}
			}
			return;
		}
		orContext.fillStyle = keliBackground.color || "#070b18";
		orContext.fillRect(0, 0, width, height);
	}

	/** Paint a full-frame photographic plate with cover fit and the scene's Ken Burns drift. */
	paintPlate(orContext, orSrc, orFramePlan, orViewport, orWarnings, orLayerId) {
		const { width, height } = orViewport;
		const keliImage = this.imageCache.get(orSrc);
		if (!keliImage) {
			this.reportMissing(orSrc, orWarnings, orLayerId);
			paintPlaceholder(orContext, orViewport, orSrc, this.imageCache.status(orSrc));
			return;
		}
		const keliKenBurns = orFramePlan.camera?.sample?.kenBurns || { scale: 1, x: 0, y: 0 };
		const keliCover = Math.max(width / keliImage.width, height / keliImage.height) * keliKenBurns.scale;
		const keliDrawWidth = keliImage.width * keliCover;
		const keliDrawHeight = keliImage.height * keliCover;
		const keliX = (width - keliDrawWidth) / 2 + keliKenBurns.x * width;
		const keliY = (height - keliDrawHeight) / 2 + keliKenBurns.y * height;
		orContext.drawImage(keliImage, keliX, keliY, keliDrawWidth, keliDrawHeight);
	}

	paintImageLayer(orContext, orMovie, orLayer, orFramePlan, orViewport, orWarnings) {
		const keliSrc = resolveLayerImageSource(orMovie, orLayer);
		const { width, height } = orViewport;
		if (orLayer.content?.plate === true) {
			if (!keliSrc) {
				orWarnings.push(missingWarning(orLayer.id));
				paintPlaceholder(orContext, orViewport, null, "failed");
				return;
			}
			this.paintPlate(orContext, keliSrc, orFramePlan, orViewport, orWarnings, orLayer.id);
			return;
		}
		if (!keliSrc) {
			orWarnings.push(missingWarning(orLayer.id));
			return;
		}
		const keliImage = this.imageCache.get(keliSrc);
		if (!keliImage) {
			this.reportMissing(keliSrc, orWarnings, orLayer.id);
			return;
		}
		const keliTransform = orLayer.transform || {};
		const keliScaleX = Math.abs(Number(keliTransform.scaleX ?? 1)) || 1;
		const keliScaleY = Math.abs(Number(keliTransform.scaleY ?? keliTransform.scaleX ?? 1)) || 1;
		let keliBoxWidth = Number(orLayer.content?.width || 0.62) * width * keliScaleX;
		let keliBoxHeight = orLayer.content?.height
			? Number(orLayer.content.height) * height * keliScaleY
			: keliBoxWidth * (keliImage.height / keliImage.width);
		if (orLayer.content?.height && !orLayer.content?.width) {
			keliBoxWidth = keliBoxHeight * (keliImage.width / keliImage.height);
		}
		const keliFit = orLayer.content?.fit || "contain";
		const keliRatio = keliFit === "cover"
			? Math.max(keliBoxWidth / keliImage.width, keliBoxHeight / keliImage.height)
			: Math.min(keliBoxWidth / keliImage.width, keliBoxHeight / keliImage.height);
		const keliDrawWidth = keliImage.width * keliRatio;
		const keliDrawHeight = keliImage.height * keliRatio;
		const keliCenterX = width * (0.5 + Number(keliTransform.x || 0) * 0.34);
		const keliCenterY = height * (0.5 + Number(keliTransform.y || 0) * 0.3);
		orContext.save();
		orContext.translate(keliCenterX, keliCenterY);
		orContext.rotate(Number(keliTransform.rotation || 0));
		orContext.globalAlpha = Math.min(1, Math.max(0, Number(keliTransform.opacity ?? 1)));
		if (BLEND_MODES.has(orLayer.style?.blendMode)) {
			orContext.globalCompositeOperation = orLayer.style.blendMode;
		}
		if (orLayer.style?.shadow !== false) {
			orContext.shadowColor = "rgba(0,0,0,0.45)";
			orContext.shadowBlur = Math.min(keliDrawWidth, keliDrawHeight) * 0.07;
			orContext.shadowOffsetY = keliDrawHeight * 0.025;
		}
		orContext.drawImage(keliImage, -keliDrawWidth / 2, -keliDrawHeight / 2, keliDrawWidth, keliDrawHeight);
		orContext.restore();
	}

	reportMissing(orSrc, orWarnings, orLayerId) {
		const keliStatus = this.imageCache.status(orSrc);
		if (keliStatus === "unknown" || keliStatus === "pending") {
			void this.imageCache.ensure(orSrc);
			return;
		}
		if (keliStatus === "failed") {
			orWarnings.push(Object.freeze({
				code: "IMAGE_LOAD_FAILED",
				layerId: orLayerId || null,
				message: `Photograph failed to load: ${orSrc}`
			}));
		}
	}
}

function missingWarning(orLayerId) {
	return Object.freeze({
		code: "MISSING_IMAGE",
		layerId: orLayerId || null,
		message: `Image layer ${orLayerId} names no source; nothing is painted for it.`
	});
}

/** A labelled stand-in so a missing photograph is visible as missing, never as a silent blank. */
function paintPlaceholder(orContext, orViewport, orSrc, orStatus) {
	const { width, height } = orViewport;
	const keliGradient = orContext.createLinearGradient(0, 0, width, height);
	keliGradient.addColorStop(0, "#1b2748");
	keliGradient.addColorStop(1, "#0a0f22");
	orContext.fillStyle = keliGradient;
	orContext.fillRect(0, 0, width, height);
	orContext.save();
	orContext.strokeStyle = "rgba(255,255,255,0.35)";
	orContext.lineWidth = 2;
	orContext.strokeRect(width * 0.06, height * 0.08, width * 0.88, height * 0.84);
	orContext.fillStyle = "rgba(255,255,255,0.85)";
	orContext.textAlign = "center";
	orContext.font = `600 ${Math.max(14, width * 0.02)}px system-ui`;
	orContext.fillText(
		orStatus === "failed" ? "Image unavailable" : "Loading image…",
		width / 2,
		height * 0.48,
		width * 0.8
	);
	if (orSrc) {
		orContext.fillStyle = "rgba(255,255,255,0.55)";
		orContext.font = `400 ${Math.max(11, width * 0.013)}px system-ui`;
		orContext.fillText(truncate(orSrc, 72), width / 2, height * 0.54, width * 0.8);
	}
	orContext.restore();
}

/** Paint caption and dialogue layers as a subtitle band along the lower safe area. */
function paintTextBand(orContext, orLayer, orViewport) {
	const keliText = orLayer.content?.text || "";
	if (!keliText) return;
	const { width, height } = orViewport;
	const keliSpeaker = orLayer.content?.speaker || orLayer.content?.castId || "";
	const keliLine = keliSpeaker ? `${keliSpeaker}: ${keliText}` : keliText;
	orContext.save();
	orContext.fillStyle = "rgba(4,6,16,0.58)";
	orContext.beginPath();
	orContext.roundRect(width * 0.07, height * 0.845, width * 0.86, height * 0.095, 12);
	orContext.fill();
	orContext.fillStyle = "white";
	orContext.textAlign = "center";
	orContext.font = `500 ${Math.max(13, width * 0.019)}px system-ui`;
	orContext.fillText(keliLine, width / 2, height * 0.9, width * 0.8);
	orContext.restore();
}

function truncate(orValue, orLimit) {
	const keliText = String(orValue);
	return keliText.length > orLimit ? `${keliText.slice(0, orLimit - 1)}…` : keliText;
}

/** Convenience export for hosts that prefer instance-free painting with an injected cache. */
export function createPhotoCompositor(orImageCache) {
	return new PhotoCompositor({ imageCache: orImageCache || new PhotoImageCache() });
}
