// B"H
import { normalizeDoorFrame } from './HouseDoorGeometry.js';

/** Builds one boolean wall and one dynamic panel from one canonical frame. */
export function createDoorWallSet(specification, material = {}) {
	const frame = normalizeDoorFrame(specification);
	return {
		wall: createDoorWallDefinition(frame, material),
		door: createDoorDefinition(frame, material.doorMaterial || {}),
		spec: frame
	};
}

export function doorWallDef(specification, material = {}) {
	return createDoorWallDefinition(normalizeDoorFrame(specification), material);
}

export function doorDefFromWall(specification, material = {}) {
	return createDoorDefinition(normalizeDoorFrame(specification), material);
}

function createDoorWallDefinition(frame, material) {
	return {
		id: frame.wallId,
		shape: 'doorway',
		solid: true,
		walkable: false,
		noEdge: frame.noEdge,
		...texture(material, frame.wallColor),
		position: {
			x: frame.center.x,
			y: frame.opening.bottomY + frame.wall.height / 2,
			z: frame.center.z
		},
		size: {
			x: frame.wall.width,
			y: frame.wall.height,
			z: frame.wall.thickness
		},
		door: {
			x: frame.opening.width,
			y: frame.opening.height
		},
		yaw: frame.yaw,
		rotation: { y: frame.yaw },
		userData: {
			AwtsmoosDoorFrame: frame,
			booleanOperation: 'difference',
			booleanSource: 'awtsmoos-procedural-core-csg'
		}
	};
}

function createDoorDefinition(frame, material) {
	return {
		id: frame.doorId,
		frame,
		position: { ...frame.center, y: 0 },
		yaw: frame.panel.closedYaw,
		closedYaw: frame.panel.closedYaw,
		wallYaw: frame.yaw,
		width: frame.panel.width,
		height: frame.panel.height,
		thickness: frame.panel.thickness,
		centerY: frame.opening.bottomY + frame.panel.height / 2,
		depth: frame.panel.closedDepth,
		openAngle: frame.openAngle,
		hingeSide: frame.hinge.side,
		hinge: frame.hinge,
		entry: frame.entry,
		opening: {
			width: frame.opening.width,
			height: frame.opening.height,
			wall: frame.wallId
		},
		...texture(material, frame.doorColor),
		userData: {
			AwtsmoosDoorFrame: frame,
			closedYawSource: 'owning-wall-frame'
		}
	};
}

function texture(material, fallbackColor) {
	return {
		color: material.color || fallbackColor,
		mapImage: material.mapImage || null,
		textureUrl: material.textureUrl || material.mapImage?.dataset?.url || material.mapImage?.src || null,
		mapRepeat: material.mapRepeat || [1, 1],
		anisotropy: material.anisotropy ?? 2,
		backfaceCull: !!material.backfaceCull,
		texturePolicy: material.texturePolicy || null
	};
}

export const normalize = normalizeDoorFrame;
