//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the position loop metrics vessel in this instant, revealing
 * its focused js ai advanced memory service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Measures repeated positional patterns without deciding policy.
 *
 * The Awtsmoos creates every frame anew, while these measurements distinguish
 * living motion from a closed circle. Awtsmoos.com keeps observation pure so
 * future AI thresholds can evolve without rewriting history traversal.
 */
export function sameRegionFrames(history, region) {
	let count = 0;
	for (let index = history.length - 1; index >= 0; index -= 1) {
		if (history[index].region !== region || history[index].attacking) {
			break;
		}
		count += 1;
	}
	return count;
}

/**
 * Reveals the detect abab behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} history The history value entering this behavior.
 */
export function detectAbab(history) {
	if (history.length < 8) {
		return 0;
	}

	let count = 0;
	for (let index = history.length - 1; index >= 3; index -= 1) {
		const a = history[index].region;
		const b = history[index - 1].region;
		if (history[index].attacking || a === b) {
			break;
		}
		if (history[index - 2].region !== a || history[index - 3].region !== b) {
			break;
		}
		count += 4;
	}
	return count;
}

/**
 * Reveals the jump loop frames behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} history The history value entering this behavior.
 */
export function jumpLoopFrames(history) {
	let count = 0;
	for (let index = history.length - 1; index >= 0; index -= 1) {
		if (history[index].attacking) {
			break;
		}
		if (!history[index].jump && index < history.length - 18) {
			break;
		}
		if (history[index].jump) {
			count += 12;
		}
	}
	return count;
}

/**
 * Reveals the edge bounce frames behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} history The history value entering this behavior.
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

/**
 * Reveals the idle near enemy frames behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} history The history value entering this behavior.
 */
export function idleNearEnemyFrames(history) {
	let count = 0;
	for (let index = history.length - 1; index >= 0; index -= 1) {
		const entry = history[index];
		if (!entry.nearEnemy || entry.attacking || Math.abs(entry.vx) > 0.35) {
			break;
		}
		count += 1;
	}
	return count;
}

/**
 * Reveals the micro walk frames behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} history The history value entering this behavior.
 */
export function microWalkFrames(history) {
	let count = 0;
	for (let index = history.length - 1; index >= 0; index -= 1) {
		const entry = history[index];
		if (entry.attacking || entry.nearEnemy || Math.abs(entry.vx) > 1.4) {
			break;
		}
		count += 1;
	}
	return count;
}
