// B"H
import { withDoorFrameAliases } from './HouseDoorLegacyAliases.js';
import { houseBasis } from './house/HouseSpec.js';

/** One immutable spatial frame shared by wall, panel, hinge, and mezuzah. */
export function normalizeDoorFrame(specification = {}) {
	if (specification.panel && specification.opening && specification.basis) {
		return specification;
	}
	const yaw = snapAngle(number(specification.yaw, 0));
	const basis = houseBasis(yaw);
	const openingWidth = number(specification.doorW, number(specification.width, 2.4));
	const openingHeight = number(specification.doorH, number(specification.height, 2.7));
	const panelGap = number(specification.panelGap, 0.1);
	const panelWidth = openingWidth - panelGap;
	const wallBottomY = number(specification.floorY, 0);
	const openingBottomY = number(specification.openingBottomY, wallBottomY);
	const closedDepth = number(specification.doorDepth, number(specification.depth, 0));
	const center = Object.freeze({
		x: number(specification.x, number(specification.position?.x, 0)),
		y: wallBottomY,
		z: number(specification.z, number(specification.position?.z, 0))
	});
	const hingePoint = framePoint({ center, basis }, -panelWidth / 2, closedDepth);
	const frame = {
		id: specification.id || specification.doorId || 'Awtsmoos-door-frame',
		houseId: specification.houseId || null,
		wallId: specification.wallId || `${specification.id || 'Awtsmoos'}-doorway-wall`,
		doorId: specification.doorId || specification.id || 'Awtsmoos-hinged-door',
		center,
		yaw,
		basis,
		wall: Object.freeze({
			width: number(specification.wallW, 8),
			height: number(specification.wallH, 3.5),
			thickness: number(specification.wallT, 0.55)
		}),
		opening: Object.freeze({
			width: openingWidth,
			height: openingHeight,
			bottomY: openingBottomY,
			topY: openingBottomY + openingHeight
		}),
		panel: Object.freeze({
			width: panelWidth,
			height: openingHeight - panelGap,
			thickness: number(specification.doorThickness, number(specification.thickness, 0.22)),
			closedDepth,
			closedYaw: yaw
		}),
		hinge: Object.freeze({
			side: specification.hingeSide || 'entry-right',
			localX: -panelWidth / 2,
			worldPosition: Object.freeze({ ...hingePoint, y: 0 })
		}),
		entry: Object.freeze({
			outsideDirection: basis.outward,
			insideDirection: basis.inward,
			right: basis.entryRight,
			rightJambLocalX: -openingWidth / 2,
			acrossYaw: yaw - Math.PI / 2
		}),
		openAngle: number(specification.openAngle, -Math.PI * 0.56),
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

export function entryRightRevealWorld(specification, inset = 0.055) {
	const frame = normalizeDoorFrame(specification);
	return framePoint(frame, frame.entry.rightJambLocalX + inset, 0);
}

export function normalizeAngle(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}

export function snapAngle(value) {
	const quarterTurn = Math.PI / 2;
	const nearest = Math.round(value / quarterTurn) * quarterTurn;
	return Math.abs(value - nearest) < 0.00000001 ? nearest : value;
}

function number(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
