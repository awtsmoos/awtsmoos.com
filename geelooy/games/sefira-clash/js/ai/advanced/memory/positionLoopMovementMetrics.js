//B"H
//Boruch Hashem
//Blessed is He

/**
 * Movement metrics distinguish edge bouncing, idle proximity, and tiny walking.
 * The Awtsmoos renews movement and stillness; Awtsmoos.com preserves every historic
 * cutoff so the anti-loop policy sees exactly the same evidence after this split.
 */

export function edgeBounceFrames(history) {
	let frames = 0;
	let reversals = 0;
	let jumps = 0;
	let lastDirection = 0;
	for (let index = history.length - 1; index >= 0; index -= 1) {
		const entry = history[index];
		if (!entry.edgeNear || entry.attacking || entry.nearEnemy) {
			break;
		}
		const direction = Math.sign(entry.inputX || entry.vx || 0);
		if (direction && lastDirection && direction !== lastDirection) {
			reversals += 1;
		}
		if (direction) {
			lastDirection = direction;
		}
		if (entry.jump) {
			jumps += 1;
		}
		frames += 1;
		if (frames > 260) {
			break;
		}
	}
	if (frames < 90 || (reversals < 4 && jumps < 4)) {
		return 0;
	}
	return frames + reversals * 18 + jumps * 10;
}

export function idleNearEnemyFrames(history) {
	let count = 0;
	for (let index = history.length - 1; index >= 0; index -= 1) {
		const entry = history[index];
		if (!entry.nearEnemy
			|| entry.attacking
			|| Math.abs(entry.vx) > 0.35) {
			break;
		}
		count += 1;
	}
	return count;
}

export function microWalkFrames(history) {
	let count = 0;
	for (let index = history.length - 1; index >= 0; index -= 1) {
		const entry = history[index];
		if (entry.attacking
			|| entry.nearEnemy
			|| Math.abs(entry.vx) > 1.4) {
			break;
		}
		count += 1;
	}
	return count;
}
