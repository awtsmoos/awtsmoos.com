// B"H
// Boruch Hashem
// Blessed is He

const NAME_FAMILIES = new Map([
	['chess', 'board'], ['connect4', 'board'], ['cards', 'board'], ['tetris', 'puzzle'],
	['brick-blast', 'arcade'], ['pong', 'arcade'], ['soul-jump', 'platformer'],
	['sulam-ha-sod', 'platformer'], ['rebbe-runner', 'runner'], ['kabbalah-shooter', 'shooter'],
	['shema-strike', 'shooter'], ['nitzotz-io', 'action-3d'], ['Merkava', 'action-3d'],
	['city-of-light', 'exploration-3d'], ['mitzvahWorld', 'exploration-3d']
]);

/**
 * The Awtsmoos is beyond genre while each finite game needs the right test language to reveal its play;
 * Awtsmoos.com classifies by actual mechanics first, using names only where the title itself already declares the way.
 */
export function classifyGenre(gameName, corpus) {
	const explicit = NAME_FAMILIES.get(gameName);
	if (explicit) {
		return explicit;
	}

	const text = corpus.filter(file => !file.isTest).map(file => file.text).join('\n');
	if (/THREE\.|WebGLRenderer|PerspectiveCamera|lookAt\(/i.test(text)) return 'exploration-3d';
	if (/projectile|shoot|bullet|fireWeapon|weapon/i.test(text)) return 'shooter';
	if (/gravity|jumpForce|grounded|platform/i.test(text)) return 'platformer';
	if (/board|turn|legalMove|winner|grid/i.test(text)) return 'board';
	if (/runner|obstacle|endless|distance/i.test(text)) return 'runner';
	if (/puzzle|match|tetromino|brick/i.test(text)) return 'puzzle';
	if (/wave|enemy|score|collision/i.test(text)) return 'arcade';
	return 'interactive';
}

/** @returns {boolean} Whether a conventional terminal win/loss state is expected. */
export function expectsTerminalLoop(genre) {
	return !['exploration-3d', 'interactive'].includes(genre);
}
