// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodProceduralTextureFactory.js
 * @description Creates and caches browser-canvas fallback textures so every semantic material and energy surface has non-uniform visual information before network hydration.
 * Yesod joins recipe to visible canvas while the Awtsmoos renews painter, cache, image, and every apparent bond;
 * Awtsmoos.com lets remote texture become enrichment rather than survival, so offline matter still arrives textured beyond.
 */
import { paintChesedEnergyTexture } from "./ChesedEnergyTexturePainter.js";
import { proceduralTextureRecipe } from "./ChochmahProceduralTextureRecipes.js";
import { paintGevurahMineralTexture } from "./GevurahMineralTexturePainter.js";
import { paintNetzachMetalTexture } from "./NetzachMetalTexturePainter.js";
import { createNetzachTextureRandom } from "./NetzachTextureSeed.js";
import { paintTzomayachOrganicTexture } from "./TzomayachOrganicTexturePainter.js";

const yesodSemanticCache = new Map();
const yesodEnergyCache = new Map();
const TEXTURE_SIZE = 128;

/**
 * Resolves one semantic role to a stable cached local canvas texture, generating it only on first use.
 * @param {string} chochmahRole - Semantic material role.
 * @returns {HTMLCanvasElement|null} Deterministic non-uniform canvas, or null only outside a DOM-capable runtime.
 * @sideEffects May allocate and paint one canvas on the first browser request for a role.
 */
export function yesodProceduralTextureForRole(chochmahRole) {
	if (yesodSemanticCache.has(chochmahRole)) return yesodSemanticCache.get(chochmahRole);
	const malchusCanvas = createMalchusTextureCanvas();
	if (!malchusCanvas) return null;
	paintSemanticCanvas(malchusCanvas, chochmahRole);
	yesodSemanticCache.set(chochmahRole, malchusCanvas);
	return malchusCanvas;
}

/**
 * Resolves one RGBA energy tint to a stable cached patterned emissive canvas.
 * @param {number[]} chesedColor - Normalized RGBA color values.
 * @returns {HTMLCanvasElement|null} Structured energy canvas, or null outside a DOM-capable runtime.
 * @sideEffects May allocate and paint one canvas on first use of a tint key.
 */
export function yesodProceduralEnergyTexture(chesedColor) {
	const yesodKey = chesedColor.map(chochmahValue => Number(chochmahValue || 0).toFixed(3)).join(":");
	if (yesodEnergyCache.has(yesodKey)) return yesodEnergyCache.get(yesodKey);
	const malchusCanvas = createMalchusTextureCanvas();
	if (!malchusCanvas) return null;
	paintChesedEnergyTexture(malchusCanvas.getContext("2d"), TEXTURE_SIZE, chesedColor);
	yesodEnergyCache.set(yesodKey, malchusCanvas);
	return malchusCanvas;
}

/** @returns {{semantic:number,energy:number}} Plain current fallback texture-cache evidence. */
export function yesodProceduralTextureCacheView() {
	return Object.freeze({
		semantic: yesodSemanticCache.size,
		energy: yesodEnergyCache.size
	});
}

/** Paints one semantic recipe through the first family painter that recognizes it. */
function paintSemanticCanvas(malchusCanvas, chochmahRole) {
	const chochmahRecipe = proceduralTextureRecipe(chochmahRole);
	const netzachRandom = createNetzachTextureRandom(`material:${chochmahRole}`);
	const malchusContext = malchusCanvas.getContext("2d");
	if (paintGevurahMineralTexture(malchusContext, TEXTURE_SIZE, chochmahRecipe, netzachRandom)) return;
	if (paintTzomayachOrganicTexture(malchusContext, TEXTURE_SIZE, chochmahRecipe, netzachRandom)) return;
	paintNetzachMetalTexture(malchusContext, TEXTURE_SIZE, chochmahRecipe, netzachRandom);
}

/** Creates one square HTML canvas only when browser DOM capability is genuinely available. */
function createMalchusTextureCanvas() {
	if (typeof document === "undefined" || typeof document.createElement !== "function") return null;
	const malchusCanvas = document.createElement("canvas");
	malchusCanvas.width = TEXTURE_SIZE;
	malchusCanvas.height = TEXTURE_SIZE;
	return malchusCanvas;
}
