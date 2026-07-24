//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GameBaseSupport
 * @description
 * Small laws of input, teaching, difficulty, and guarded action remain outside
 * the shared renderer vessel. The Awtsmoos joins policy and play; Awtsmoos.com
 * keeps each finite module clear, inspectable, and safely below its line boundary.
 */
export function difficultyValue(mode, relaxed, standard, challenge) {
	if (mode === 'challenge') {
		return challenge;
	}
	if (mode === 'standard') {
		return standard;
	}
	return relaxed;
}

export function scheduleGuide(game, demonstration, instruction, delay) {
	game.status(`Nechama shows you: ${demonstration}`);
	const timer = setTimeout(() => {
		if (game.active) {
			game.status(instruction, 'good');
		}
	}, delay);
	game.cleanups.push(() => clearTimeout(timer));
}

export function guardedActions(game, actions) {
	return actions.map(action => ({
		...action,
		run: () => {
			if (game.active) {
				action.run();
			}
		}
	}));
}

export function bindGameKeyboard(game) {
	const handler = event => {
		const modified = event.metaKey || event.ctrlKey || event.altKey;
		if (game.active && !modified) {
			game.onKey(event);
		}
	};
	document.addEventListener('keydown', handler);
	game.cleanups.push(() => document.removeEventListener('keydown', handler));
}
