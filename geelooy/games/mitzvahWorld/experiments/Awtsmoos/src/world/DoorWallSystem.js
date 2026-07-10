// B"H
import {
	doorPanelDepth,
	normalizeDoorFrame
} from './HouseDoorGeometry.js';

/**
 * Produces one boolean doorway wall and one perfectly aligned dynamic panel
 * from the same normalized wall frame.
 */
export function createDoorWallSet(specification, material = {}) {
	const frame = normalizeDoorFrame(specification);
	return {
		wall: createDoorWallDefinition(frame, material),
		door: createDoorDefinition(frame, material.doorMaterial || {}),
		spec: frame
	};
}

/**
 * Returns the procedural doorway definition consumed by the true CSG bridge.
 */
export function doorWallDef(specification, material = {}) {
	return createDoorWallDefinition(
		normalizeDoorFrame(specification),
		material
	);
}

/**
 * Returns the dynamic panel definition whose closed yaw and center plane come
 * directly from the owning wall frame.
 */
export function doorDefFromWall(specification, material = {}) {
	return createDoorDefinition(
		normalizeDoorFrame(specification),
		material
	);
}

function createDoorWallDefinition(frame, material) {
	return {
		id: frame.wallId,
		shape: 'doorway',
		solid: true,
		walkable: false,
		noEdge: frame.noEdge,
		color: material.color || frame.wallColor,
		mapImage: material.mapImage || null,
		textureUrl:
			material.textureUrl ||
			material.mapImage?.dataset?.url ||
			material.mapImage?.src ||
			null,
		mapRepeat: material.mapRepeat || [1, 1],
		anisotropy: material.anisotropy ?? 2,
		backfaceCull: !!material.backfaceCull,
		texturePolicy: material.texturePolicy || null,
		position: {
			x: frame.x,
			y: frame.floorY + frame.wallH / 2,
			z: frame.z
		},
		size: {
			x: frame.wallW,
			y: frame.wallH,
			z: frame.wallT
		},
		door: {
			x: frame.doorW,
			y: frame.doorH
		},
		yaw: frame.yaw,
		rotation: { y: frame.yaw },
		userData: {
			AwtsmoosDoorWallSpec: frame,
			booleanOperation: 'difference',
			booleanSource: 'awtsmoos-procedural-core-csg'
		}
	};
}

function createDoorDefinition(frame, material) {
	const panelWidth = frame.doorW - frame.panelGap;
	const panelHeight = frame.doorH - frame.panelGap;
	return {
		id: frame.doorId,
		position: {
			x: frame.x,
			y: 0,
			z: frame.z
		},
		yaw: frame.yaw,
		width: panelWidth,
		height: panelHeight,
		thickness: frame.doorThickness,
		centerY: frame.floorY + panelHeight / 2,
		depth: doorPanelDepth(frame),
		openAngle: frame.openAngle,
		hingeSide: frame.hingeSide,
		entryDirection: frame.entryDirection,
		opening: {
			width: frame.doorW,
			height: frame.doorH,
			wall: frame.wallId
		},
		color: material.color || frame.doorColor,
		mapImage: material.mapImage || null,
		textureUrl:
			material.textureUrl ||
			material.mapImage?.dataset?.url ||
			material.mapImage?.src ||
			null,
		mapRepeat: material.mapRepeat || [1, 1],
		anisotropy: material.anisotropy ?? 2,
		backfaceCull: !!material.backfaceCull,
		texturePolicy: material.texturePolicy || null,
		userData: {
			AwtsmoosDoorWallSpec: frame,
			closedYawSource: 'owning-wall-frame'
		}
	};
}

export const normalize = normalizeDoorFrame;
