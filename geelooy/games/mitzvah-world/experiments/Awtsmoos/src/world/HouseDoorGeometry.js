// B"H
import {
	chooseDoorSwing,
	finiteNumber,
	freezePoint
} from './DoorFrameUtilities.js';
import { worldMatrixFromYaw } from './DoorWorldMatrix.js';
import { withDoorFrameAliases } from './HouseDoorLegacyAliases.js';
import { houseBasis } from './house/HouseSpec.js';

/** Creates the immutable doorway truth shared by wall, panel, collider, and mezuzah. */
export function normalizeDoorFrame(specification = {}) {
	if (specification.closedWorldMatrix && specification.panel && specification.opening) {
		return specification;
	}
	const yaw = snapAngle(finiteNumber(specification.yaw, 0));
	const basis = houseBasis(yaw);
	const openingWidth = finiteNumber(specification.doorW, finiteNumber(specification.width, 2.4));
	const openingHeight = finiteNumber(specification.doorH, finiteNumber(specification.height, 2.7));
	const panelGap = finiteNumber(specification.panelGap, 0.1);
	const panelWidth = openingWidth - panelGap;
	const panelHeight = openingHeight - panelGap;
	const floorY = finiteNumber(specification.floorY, 0);
	const openingBottomY = finiteNumber(specification.openingBottomY, floorY);
	const closedDepth = finiteNumber(specification.doorDepth, finiteNumber(specification.depth, 0));
	const center = freezePoint(specification.x ?? specification.position?.x, floorY, specification.z ?? specification.position?.z);
	const hingeSide = specification.hingeSide || 'entry-right';
	const hingeLocalX = hingeSide === 'entry-right' ? panelWidth / 2 : -panelWidth / 2;
	const hingePoint = framePoint({ center, basis }, hingeLocalX, closedDepth);
	const closedPoint = framePoint({ center, basis }, 0, closedDepth);
	const closedCenter = freezePoint(closedPoint.x, openingBottomY + panelHeight / 2, closedPoint.z);
	const swing = chooseDoorSwing(hingeLocalX, specification.openAngle, panelWidth);
	const frame = {
		id: specification.id || specification.doorId || 'Awtsmoos-door-frame',
		houseId: specification.houseId || null,
		wallId: specification.wallId || `${specification.id || 'Awtsmoos'}-doorway-wall`,
		doorId: specification.doorId || specification.id || 'Awtsmoos-hinged-door',
		center,
		yaw,
		basis,
		wall: Object.freeze({
			width: finiteNumber(specification.wallW, 8),
			height: finiteNumber(specification.wallH, 3.5),
			thickness: finiteNumber(specification.wallT, 0.55)
		}),
		opening: Object.freeze({
			width: openingWidth,
			height: openingHeight,
			bottomY: openingBottomY,
			topY: openingBottomY + openingHeight
		}),
		panel: Object.freeze({
			width: panelWidth,
			height: panelHeight,
			thickness: finiteNumber(specification.doorThickness, finiteNumber(specification.thickness, 0.22)),
			closedDepth,
			closedYaw: yaw,
			closedCenter
		}),
		hinge: Object.freeze({
			side: hingeSide,
			localX: hingeLocalX,
			worldPosition: freezePoint(hingePoint.x, openingBottomY, hingePoint.z)
		}),
		entry: Object.freeze({
			outsideDirection: basis.outward,
			insideDirection: basis.inward,
			right: basis.entryRight,
			rightJambLocalX: openingWidth / 2,
			acrossYaw: yaw - Math.PI / 2
		}),
		swing,
		openAngle: swing.openAngle,
		closedWorldMatrix: Object.freeze(worldMatrixFromYaw(closedCenter, yaw)),
		noEdge: !!specification.noEdge,
		wallColor: specification.wallColor || '#ddd3c6',
		doorColor: specification.doorColor || specification.color || '#8a5228'
	};
	return Object.freeze(withDoorFrameAliases(frame));
}

export function framePoint(frame, localX, inwardDepth) {
	return {
		x: frame.center.x + frame.basis.right.x * localX + frame.basis.inward.x * inwardDepth,
		z: frame.center.z + frame.basis.right.z * localX + frame.basis.inward.z * inwardDepth
	};
}

export function doorPanelDepth(specification) {
	return normalizeDoorFrame(specification).panel.closedDepth;
}

export function doorHingeWorld(specification) {
	return normalizeDoorFrame(specification).hinge.worldPosition;
}

export function entryRightRevealWorld(specification, jambInset = 0.055, revealDepth = 0.04) {
	const frame = normalizeDoorFrame(specification);
	return framePoint(frame, frame.entry.rightJambLocalX - jambInset, revealDepth);
}

export function normalizeAngle(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}

export function snapAngle(value) {
	const quarterTurn = Math.PI / 2;
	const nearest = Math.round(value / quarterTurn) * quarterTurn;
	return Math.abs(value - nearest) < 0.00000001 ? nearest : value;
}
