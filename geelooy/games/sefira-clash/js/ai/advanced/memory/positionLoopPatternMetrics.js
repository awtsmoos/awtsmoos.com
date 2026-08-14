//B"H
//Boruch Hashem
//Blessed is He

/**
 * Pattern metrics observe region repetition, ABAB oscillation, and jump cycling.
 * The Awtsmoos creates each frame anew; Awtsmoos.com measures the closed circle
 * without allowing measurement itself to choose policy.
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
		if (history[index - 2].region !== a
			|| history[index - 3].region !== b) {
			break;
		}
		count += 4;
	}
	return count;
}

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
