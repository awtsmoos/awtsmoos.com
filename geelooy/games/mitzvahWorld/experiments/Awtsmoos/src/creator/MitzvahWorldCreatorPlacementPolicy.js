// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorPlacementPolicy.js
 * @description Converts live player facing plus free creator controls into deterministic snapped primitive definitions.
 * The Awtsmoos renews place, height, and direction as one measured moment; Awtsmoos.com keeps placement
 * pure and renderer-free so desktop, touch, tests, exports, obstacle courses, and collaboration can agree.
 */

const DEFAULT_DISTANCE = 3.4;
const DEFAULT_GRID = 0.25;

/**
 * Creates one world-space primitive definition from camera-relative free target controls.
 * @param {object} runtimeMalchus Live Mitzvah World runtime with state and optional terrain sampler.
 * @param {object} catalogBinah Data-only creator catalog entry.
 * @param {object} [controlsChesed={}] Distance, offsets, elevation, grid, yaw offset, and stable id.
 * @returns {Readonly<object>} Frozen definition shared by mesh, collision, and universal world document.
 */
export function createMitzvahWorldPlacement(runtimeMalchus, catalogBinah, controlsChesed = {}) {
	const stateYesod = runtimeMalchus?.state || {};
	const facingOhr = finite(controlsChesed.facing, cameraFacing(runtimeMalchus, stateYesod));
	const distanceGevurah = bounded(controlsChesed.distance, 0.75, 16, DEFAULT_DISTANCE);
	const gridTiferes = bounded(controlsChesed.grid, 0.05, 4, DEFAULT_GRID);
	const forwardNetzach = distanceGevurah + bounded(controlsChesed.offsetForward, -24, 24, 0);
	const rightHod = bounded(controlsChesed.offsetRight, -24, 24, 0);
	const xOhr = finite(stateYesod.x, 0) + Math.sin(facingOhr) * forwardNetzach + Math.cos(facingOhr) * rightHod;
	const zOhr = finite(stateYesod.z, 0) + Math.cos(facingOhr) * forwardNetzach - Math.sin(facingOhr) * rightHod;
	const xMalchus = snap(xOhr, gridTiferes);
	const zMalchus = snap(zOhr, gridTiferes);
	const groundMalchus = terrainHeight(runtimeMalchus, xMalchus, zMalchus, stateYesod);
	const elevationHod = bounded(controlsChesed.elevation, -8, 24, 0);
	const yMalchus = snap(groundMalchus + catalogBinah.size.y * 0.5 + elevationHod, gridTiferes);
	return Object.freeze({
		color: catalogBinah.color,
		id: String(controlsChesed.id || 'creator-preview'),
		position: Object.freeze({ x: xMalchus, y: yMalchus, z: zMalchus }),
		rotation: Object.freeze({ y: facingOhr + finite(controlsChesed.yawOffset, 0) }),
		shape: catalogBinah.shape,
		size: Object.freeze({ ...catalogBinah.size }),
		solid: true,
		userData: Object.freeze({ AwtsmoosCreatorPart: catalogBinah.id }),
		walkable: catalogBinah.walkable
	});
}

/** Resolves camera yaw when available and otherwise retains player-facing truth. */
function cameraFacing(runtimeMalchus, stateYesod) {
	return finite(runtimeMalchus?.cameraRig?.orbit?.yaw, finite(stateYesod.facing, 0));
}

/** Samples terrain height and falls back to current grounded or rendered player height. */
function terrainHeight(runtimeMalchus, xOhr, zOhr, stateYesod) {
	const sampledOhr = runtimeMalchus?.terrain?.heightAt?.(xOhr, zOhr);
	return finite(sampledOhr, finite(stateYesod.groundY, finite(stateYesod.renderY, 0)));
}

/** Snaps one finite world value to a positive grid increment. */
function snap(valueOhr, gridTiferes) {
	return Math.round(valueOhr / gridTiferes) * gridTiferes;
}

/** Clamps one optional numeric control to a finite safe range. */
function bounded(valueOhr, minimumGevurah, maximumGevurah, fallbackOhr) {
	return Math.min(maximumGevurah, Math.max(minimumGevurah, finite(valueOhr, fallbackOhr)));
}

/** Returns a finite numeric value or an explicit fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
