// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorPlacementPolicy.js
 * @description Adds Mitzvah terrain and catalog semantics around shared renderer-free placement mathematics.
 * The Awtsmoos renews place, height, and direction as one measured moment; Awtsmoos.com keeps universal grid law in Core
 * while this game alone decides terrain, buildable size, walkability, color, and Creator-part identity.
 */

import {
	boundedPlacementNumber,
	finitePlacementNumber,
	placementPointFromFacing,
	snapPlacementPoint,
	snapPlacementValue
} from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';

const DEFAULT_DISTANCE = 3.4;
const DEFAULT_GRID = 0.25;

export function createMitzvahWorldPlacement(runtimeMalchus, catalogBinah, controlsChesed = {}) {
	const stateYesod = runtimeMalchus?.state || {};
	const facingOhr = finitePlacementNumber(controlsChesed.facing, cameraFacing(runtimeMalchus, stateYesod));
	const distanceGevurah = boundedPlacementNumber(controlsChesed.distance, 0.75, 16, DEFAULT_DISTANCE);
	const gridTiferes = boundedPlacementNumber(controlsChesed.grid, 0.05, 4, DEFAULT_GRID);
	const pointOhr = placementPointFromFacing(
		stateYesod,
		facingOhr,
		distanceGevurah + boundedPlacementNumber(controlsChesed.offsetForward, -24, 24, 0),
		boundedPlacementNumber(controlsChesed.offsetRight, -24, 24, 0)
	);
	const pointMalchus = snapPlacementPoint(pointOhr, gridTiferes);
	const groundMalchus = terrainHeight(runtimeMalchus, pointMalchus.x, pointMalchus.z, stateYesod);
	const elevationHod = boundedPlacementNumber(controlsChesed.elevation, -8, 24, 0);
	const yMalchus = snapPlacementValue(groundMalchus + catalogBinah.size.y * 0.5 + elevationHod, gridTiferes);

	return Object.freeze({
		color: catalogBinah.color,
		id: String(controlsChesed.id || 'creator-preview'),
		position: Object.freeze({ x: pointMalchus.x, y: yMalchus, z: pointMalchus.z }),
		rotation: Object.freeze({ y: facingOhr + finitePlacementNumber(controlsChesed.yawOffset, 0) }),
		shape: catalogBinah.shape,
		size: Object.freeze({ ...catalogBinah.size }),
		solid: true,
		userData: Object.freeze({ AwtsmoosCreatorPart: catalogBinah.id }),
		walkable: catalogBinah.walkable
	});
}

function cameraFacing(runtimeMalchus, stateYesod) {
	return finitePlacementNumber(runtimeMalchus?.cameraRig?.orbit?.yaw, finitePlacementNumber(stateYesod.facing, 0));
}

function terrainHeight(runtimeMalchus, xOhr, zOhr, stateYesod) {
	const sampledOhr = runtimeMalchus?.terrain?.heightAt?.(xOhr, zOhr);
	return finitePlacementNumber(
		sampledOhr,
		finitePlacementNumber(stateYesod.groundY, finitePlacementNumber(stateYesod.renderY, 0))
	);
}
