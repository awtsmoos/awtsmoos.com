// B"H

/**
 * Produces the canonical wall-space frame used by the wall, door panel,
 * collider, hinge, and mezuzah. All rotations come directly from the owning
 * wall, including rotated houses.
 */
export function normalizeDoorFrame(specification = {}) {
	const yaw = snapAngle(number(specification.yaw, 0));
	const doorWidth = number(
		specification.doorW,
		number(specification.width, 2.4)
	);
	const panelGap = number(specification.panelGap, 0.1);
	return {
		wallId: specification.wallId || `${specification.id || 'Awtsmoos'}-doorway-wall`,
		doorId: specification.doorId || specification.id || 'Awtsmoos-hinged-door',
		x: number(specification.x, number(specification.position?.x, 0)),
		z: number(specification.z, number(specification.position?.z, 0)),
		floorY: number(specification.floorY, 0),
		yaw,
		wallW: number(specification.wallW, 8),
		wallH: number(specification.wallH, 3.5),
		wallT: number(specification.wallT, 0.55),
		doorW: doorWidth,
		doorH: number(specification.doorH, number(specification.height, 2.7)),
		doorThickness: number(specification.doorThickness, number(specification.thickness, 0.22)),
		panelGap,
		doorDepth: specification.doorDepth ?? specification.depth,
		openAngle: number(specification.openAngle, -Math.PI * 0.56),
		noEdge: !!specification.noEdge,
		wallColor: specification.wallColor || '#ddd3c6',
		doorColor: specification.doorColor || specification.color || '#8a5228',
		hingeSide: 'entry-right',
		entryDirection: 'local-negative-z',
		rightJambLocalX: -doorWidth / 2
	};
}

/** Converts local wall coordinates into world coordinates. */
export function localToWorld(frame, localX, localZ) {
	const cosine = Math.cos(frame.yaw);
	const sine = Math.sin(frame.yaw);
	return {
		x: frame.x + localX * cosine + localZ * sine,
		z: frame.z + localX * sine - localZ * cosine
	};
}

/** Returns the exact closed panel plane inside the doorway reveal. */
export function doorPanelDepth(frame) {
	return frame.doorDepth ?? 0;
}

/** Returns the hinge point derived from the exact owning wall frame. */
export function doorHingeWorld(specification) {
	const frame = normalizeDoorFrame(specification);
	const panelWidth = frame.doorW - frame.panelGap;
	const point = localToWorld(frame, -panelWidth / 2, doorPanelDepth(frame));
	return { x: point.x, y: 0, z: point.z };
}

/**
 * Returns the entry-right jamb point inside the reveal, slightly behind the
 * exterior wall face so the mezuzah is visible from outside but belongs to the
 * doorway cavity itself.
 */
export function entryRightRevealWorld(specification, inset = 0.055) {
	const frame = normalizeDoorFrame(specification);
	const localX = -frame.doorW / 2 + inset;
	const localZ = frame.wallT / 2 - inset;
	return localToWorld(frame, localX, localZ);
}

export function snapAngle(value) {
	const quarterTurn = Math.PI / 2;
	const nearest = Math.round(value / quarterTurn) * quarterTurn;
	return Math.abs(value - nearest) < 0.0005 ? nearest : value;
}

function number(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
