//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CinematicGrade.js
 * @description The same light is warmed, edged, and grained the same way on every frame;
 * Awtsmoos.com applies the cinematic grade deterministically, seeded by frame index, so preview grain matches export grain.
 */

/**
 * Apply vignette, letterbox, color temperature, and film grain to a 2D context.
 * The grade spec comes from resolveMovieRenderGrade; the same frame index always produces the same grain.
 */
export function applyCinematicGrade(orContext, orViewport, orGrade, orFrameIndex = 0) {
	if (!orContext || !orGrade?.enabled) return;
	const { width, height } = orViewport;
	if (orGrade.temperature) applyTemperature(orContext, width, height, orGrade.temperature);
	if (orGrade.vignette > 0) applyVignette(orContext, width, height, orGrade.vignette);
	if (orGrade.grain > 0) applyGrain(orContext, width, height, orGrade.grain, orFrameIndex);
	if (orGrade.letterbox > 0) applyLetterbox(orContext, width, height, orGrade.letterbox);
}

function applyTemperature(orContext, orWidth, orHeight, orTemperature) {
	orContext.save();
	orContext.globalCompositeOperation = "overlay";
	orContext.fillStyle = orTemperature > 0
		? `rgba(255, 166, 66, ${Math.abs(orTemperature) * 0.16})`
		: `rgba(84, 142, 255, ${Math.abs(orTemperature) * 0.16})`;
	orContext.fillRect(0, 0, orWidth, orHeight);
	orContext.restore();
}

function applyVignette(orContext, orWidth, orHeight, orAmount) {
	const keliRadius = Math.hypot(orWidth, orHeight) / 2;
	const keliGradient = orContext.createRadialGradient(
		orWidth / 2, orHeight / 2, keliRadius * 0.42,
		orWidth / 2, orHeight / 2, keliRadius
	);
	keliGradient.addColorStop(0, "rgba(0,0,0,0)");
	keliGradient.addColorStop(1, `rgba(2,3,10,${(orAmount * 0.62).toFixed(3)})`);
	orContext.save();
	orContext.fillStyle = keliGradient;
	orContext.fillRect(0, 0, orWidth, orHeight);
	orContext.restore();
}

function applyLetterbox(orContext, orWidth, orHeight, orAmount) {
	const keliBar = Math.round(orHeight * orAmount);
	orContext.save();
	orContext.fillStyle = "#000000";
	orContext.fillRect(0, 0, orWidth, keliBar);
	orContext.fillRect(0, orHeight - keliBar, orWidth, keliBar);
	orContext.restore();
}

let grainCache = { frameIndex: null, canvas: null };

function applyGrain(orContext, orWidth, orHeight, orAmount, orFrameIndex) {
	const keliPatternCanvas = grainCanvas(orFrameIndex);
	if (!keliPatternCanvas) return;
	const keliPattern = orContext.createPattern?.(keliPatternCanvas, "repeat");
	if (!keliPattern) return;
	orContext.save();
	orContext.globalAlpha = Math.min(0.5, orAmount * 0.85);
	orContext.globalCompositeOperation = "overlay";
	const keliOffsetX = (orFrameIndex * 37) % 128;
	const keliOffsetY = (orFrameIndex * 53) % 128;
	orContext.translate(-keliOffsetX, -keliOffsetY);
	orContext.fillStyle = keliPattern;
	orContext.fillRect(0, 0, orWidth + 128, orHeight + 128);
	orContext.restore();
}

/** Build (and single-slot cache) the deterministic 128px noise tile for one frame index. */
function grainCanvas(orFrameIndex) {
	if (grainCache.frameIndex === orFrameIndex && grainCache.canvas) return grainCache.canvas;
	const keliFactory = canvasFactory();
	if (!keliFactory) return null;
	const keliCanvas = keliFactory();
	keliCanvas.width = 128;
	keliCanvas.height = 128;
	const keliContext = keliCanvas.getContext?.("2d");
	if (!keliContext) return null;
	const keliImage = keliContext.createImageData(128, 128);
	const keliRandom = mulberry32(0x9e3779b9 ^ (orFrameIndex + 1));
	for (let keliIndex = 0; keliIndex < keliImage.data.length; keliIndex += 4) {
		const keliValue = Math.floor(keliRandom() * 255);
		keliImage.data[keliIndex] = keliValue;
		keliImage.data[keliIndex + 1] = keliValue;
		keliImage.data[keliIndex + 2] = keliValue;
		keliImage.data[keliIndex + 3] = 255;
	}
	keliContext.putImageData(keliImage, 0, 0);
	grainCache = { frameIndex: orFrameIndex, canvas: keliCanvas };
	return keliCanvas;
}

function canvasFactory() {
	if (typeof OffscreenCanvas === "function") return () => new OffscreenCanvas(128, 128);
	if (typeof document !== "undefined" && document?.createElement) {
		return () => document.createElement("canvas");
	}
	return null;
}

/** Small deterministic PRNG; identical seeds yield identical grain on every machine. */
export function mulberry32(orSeed) {
	let keliState = orSeed >>> 0;
	return function next() {
		keliState = (keliState + 0x6d2b79f5) >>> 0;
		let keliValue = keliState;
		keliValue = Math.imul(keliValue ^ (keliValue >>> 15), keliValue | 1);
		keliValue ^= keliValue + Math.imul(keliValue ^ (keliValue >>> 7), keliValue | 61);
		return ((keliValue ^ (keliValue >>> 14)) >>> 0) / 4294967296;
	};
}
