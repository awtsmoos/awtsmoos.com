// B"H
import {
	add,
	scale,
	v
} from '../math/Geometry3D.js';
import { doorHingeWorld } from './HouseDoorGeometry.js';

export function closedYaw(definition) {
	return definition.closedYaw ?? definition.wallYaw ?? definition.yaw;
}

export function hingeWorld(definition) {
	return definition.hinge?.worldPosition || doorHingeWorld(definition.frame || definition);
}

export function currentAngle(definition, progress) {
	const eased = progress * progress * (3 - 2 * progress);
	return (definition.openAngle ?? -Math.PI * 0.58) * eased;
}

export function centerFor(definition, yaw) {
	const hinge = hingeWorld(definition);
	const right = v(Math.cos(yaw), 0, Math.sin(yaw));
	const center = add(hinge, scale(right, definition.width / 2));
	center.y = (hinge.y || 0) + definition.centerY;
	return center;
}

export function orientedBox(definition, progress) {
	const yaw = closedYaw(definition) + currentAngle(definition, progress);
	return {
		center: centerFor(definition, yaw),
		right: v(Math.cos(yaw), 0, Math.sin(yaw)),
		up: v(0, 1, 0),
		forward: v(Math.sin(yaw), 0, -Math.cos(yaw)),
		half: {
			x: definition.width / 2,
			y: definition.height / 2,
			z: Math.max(definition.thickness / 2, 0.12)
		}
	};
}

export function colliderDefinition(definition, progress = 0) {
	const yaw = closedYaw(definition) + currentAngle(definition, progress);
	return {
		id: `${definition.id}-door`,
		shape: 'box',
		solid: true,
		walkable: false,
		position: centerFor(definition, yaw),
		size: {
			x: definition.width,
			y: definition.height,
			z: definition.thickness
		},
		rotation: { y: yaw }
	};
}
