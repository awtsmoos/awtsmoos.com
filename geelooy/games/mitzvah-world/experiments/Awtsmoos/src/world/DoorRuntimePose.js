// B"H
import { v } from '../math/Geometry3D.js';
import { doorHingeWorld } from './HouseDoorGeometry.js';
import { worldMatrixFromYaw } from './DoorWorldMatrix.js';

export function closedYaw(definition) {
	return definition.frame?.yaw ?? definition.closedYaw ?? definition.wallYaw ?? definition.yaw ?? 0;
}

export function hingeWorld(definition) {
	return definition.hinge?.worldPosition || doorHingeWorld(definition.frame || definition);
}

export function currentAngle(definition, progress) {
	if (progress <= 0) {
		return 0;
	}
	const openAngle = definition.frame?.swing?.openAngle ?? definition.openAngle ?? -Math.PI * 0.58;
	if (progress >= 1) {
		return openAngle;
	}
	const eased = progress * progress * (3 - 2 * progress);
	return openAngle * eased;
}

/** Derives the complete visible and collider pose from one immutable frame. */
export function doorPose(definition, progress = 0) {
	const clamped = Math.max(0, Math.min(1, progress));
	const angle = currentAngle(definition, clamped);
	const yaw = closedYaw(definition) + angle;
	if (clamped === 0 && definition.frame?.closedWorldMatrix) {
		return {
			progress: 0,
			angle: 0,
			yaw: closedYaw(definition),
			center: { ...definition.frame.panel.closedCenter },
			matrix: [...definition.frame.closedWorldMatrix]
		};
	}
	const hinge = hingeWorld(definition);
	const hingeSign = Math.sign(definition.frame?.hinge?.localX || -1);
	const centerOffset = -hingeSign * definition.width / 2;
	const center = {
		x: hinge.x + Math.cos(yaw) * centerOffset,
		y: definition.centerY,
		z: hinge.z + Math.sin(yaw) * centerOffset
	};
	return {
		progress: clamped,
		angle,
		yaw,
		center,
		matrix: worldMatrixFromYaw(center, yaw)
	};
}

export function centerFor(definition, yaw) {
	const hinge = hingeWorld(definition);
	const hingeSign = Math.sign(definition.frame?.hinge?.localX || -1);
	const centerOffset = -hingeSign * definition.width / 2;
	return {
		x: hinge.x + Math.cos(yaw) * centerOffset,
		y: definition.centerY,
		z: hinge.z + Math.sin(yaw) * centerOffset
	};
}

export function orientedBox(definition, progress) {
	const pose = doorPose(definition, progress);
	return {
		center: pose.center,
		right: v(Math.cos(pose.yaw), 0, Math.sin(pose.yaw)),
		up: v(0, 1, 0),
		forward: v(-Math.sin(pose.yaw), 0, Math.cos(pose.yaw)),
		half: {
			x: definition.width / 2,
			y: definition.height / 2,
			z: Math.max(definition.thickness / 2, 0.12)
		}
	};
}

export function colliderDefinition(definition, progress = 0) {
	const pose = doorPose(definition, progress);
	return {
		id: `${definition.id}-door`,
		shape: 'box',
		solid: true,
		walkable: false,
		position: pose.center,
		size: {
			x: definition.width,
			y: definition.height,
			z: definition.thickness
		},
		rotation: { y: pose.yaw },
		userData: {
			AwtsmoosDoorPose: {
				progress: pose.progress,
				angle: pose.angle,
				worldMatrix: pose.matrix
			}
		}
	};
}
