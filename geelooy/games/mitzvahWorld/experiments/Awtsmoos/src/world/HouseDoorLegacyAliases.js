// B"H
/** Preserves old flat fields while the nested frame remains authoritative. */
export function withDoorFrameAliases(frame) {
	return {
		...frame,
		x: frame.center.x,
		z: frame.center.z,
		floorY: frame.center.y,
		openingBottomY: frame.opening.bottomY,
		wallW: frame.wall.width,
		wallH: frame.wall.height,
		wallT: frame.wall.thickness,
		doorW: frame.opening.width,
		doorH: frame.opening.height,
		doorThickness: frame.panel.thickness,
		panelGap: frame.opening.width - frame.panel.width,
		doorDepth: frame.panel.closedDepth,
		hingeSide: frame.hinge.side,
		rightJambLocalX: frame.entry.rightJambLocalX
	};
}
