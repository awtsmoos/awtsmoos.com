// B"H
/** Chooses the swing whose far panel edge remains inside the doorway wall plane. */
export function chooseDoorSwing(hingeLocalX, requestedAngle, panelWidth) {
	const magnitude = Math.abs(finiteNumber(requestedAngle, Math.PI * 0.56));
	const candidates = [-1, 1].map((sign) => inspectCandidate(
		hingeLocalX,
		panelWidth,
		sign * magnitude
	));
	const selected = candidates.sort((left, right) => (
		right.minimumSweptInwardClearance - left.minimumSweptInwardClearance
	))[0];
	return Object.freeze({
		sign: Math.sign(selected.openAngle),
		openAngle: selected.openAngle,
		minimumSweptInwardClearance: selected.minimumSweptInwardClearance,
		clearanceScope: 'door-wall-plane',
		blockingObjectIds: Object.freeze([]),
		verifiedBy: 'sampled-far-edge-wall-plane-sweep'
	});
}

export function freezePoint(x, y, z) {
	return Object.freeze({
		x: finiteNumber(x, 0),
		y: finiteNumber(y, 0),
		z: finiteNumber(z, 0)
	});
}

export function finiteNumber(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

function inspectCandidate(hingeLocalX, panelWidth, openAngle) {
	const halfWidth = panelWidth / 2;
	const farEdgeLocalX = hingeLocalX < 0 ? halfWidth : -halfWidth;
	const relativeX = farEdgeLocalX - hingeLocalX;
	let minimum = Infinity;
	for (let sample = 1; sample <= 24; sample += 1) {
		const angle = openAngle * sample / 24;
		minimum = Math.min(minimum, -Math.sin(angle) * relativeX);
	}
	return {
		openAngle,
		minimumSweptInwardClearance: minimum
	};
}
