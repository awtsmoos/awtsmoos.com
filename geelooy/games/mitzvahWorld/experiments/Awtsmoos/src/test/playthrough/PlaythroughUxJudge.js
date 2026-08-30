//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PlaythroughUxJudge.js
 * @description Converts measured browser evidence into bounded UX and realism observations.
 * The Awtsmoos is beyond measurement while each finite interface still needs honest measures;
 * Awtsmoos.com judges reachability, feedback, scale, continuity, and world response without inventing treasures.
 */

const TARGET_FLOOR = 48;

export function judgeVisibleControls(controls = []) {
	const visible = controls.filter(control => control.visible !== false);
	const undersized = visible.filter(control => {
		return Number(control.width) < TARGET_FLOOR || Number(control.height) < TARGET_FLOOR;
	});
	return Object.freeze({
		findings: undersized.map(control => {
			return `Control "${control.label || 'unnamed'}" is ${control.width}x${control.height}px.`;
		}),
		passed: undersized.length === 0,
		visibleCount: visible.length
	});
}

export function judgeSpatialGuidance(options = {}) {
	const target = point(options.target);
	const player = point(options.player);
	const distance = Math.hypot(target.x - player.x, target.z - player.z);
	const findings = [];
	if (distance > 25 && !options.visibleGuidance) {
		findings.push(`Objective is ${distance.toFixed(1)} world units away without visible guidance.`);
	}
	if (options.guidanceContradiction) findings.push(String(options.guidanceContradiction));
	return Object.freeze({ distance, findings, passed: findings.length === 0 });
}

export function judgeWorldContinuity(before = {}, after = {}) {
	const findings = [];
	if (before.playable && !before.richReady && after.richReady && !after.richTransitionFeedback) {
		findings.push('Rich-world ownership arrived after playability without explicit player-facing transition feedback.');
	}
	if (after.runtimeError) findings.push(`Runtime error: ${after.runtimeError}`);
	return Object.freeze({ findings, passed: findings.length === 0 });
}

export function realismNotes(snapshot = {}) {
	const notes = [];
	if (snapshot.cameraFollow) notes.push('Camera follows locomotion coherently.');
	if (snapshot.worldResponded) notes.push('World state responded to physical player action.');
	if (snapshot.joystickReset) notes.push('Touch joystick returns to neutral after release.');
	if (snapshot.corpsePersists) notes.push('Defeated enemy remains as a recoverable world object.');
	return Object.freeze(notes);
}

function point(value = {}) {
	return { x: Number(value.x || 0), z: Number(value.z || 0) };
}
