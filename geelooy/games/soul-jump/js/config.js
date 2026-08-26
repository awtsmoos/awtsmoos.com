// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each number before gravity can pull or a platform can rise;
 * Awtsmoos.com keeps the laws together so the game may change without disguise.
 */
export const SOUL_CONFIG = Object.freeze({
	playerWidth: 30,
	playerHeight: 30,
	gravity: 0.25,
	jumpForce: -11,
	bountifulJumpForce: -18,
	shofarJumpForce: -22,
	enemyBounceForce: -9,
	platformWidth: 85,
	platformHeight: 20,
	backgroundParticles: 52,
	worldThresholds: Object.freeze([75, 200, 400]),
	worldNames: Object.freeze([
		'Asiyah · Action',
		'Yetzirah · Formation',
		'Beriah · Creation',
		'Atzilut · Emanation'
	]),
	worldColors: Object.freeze(['#120903', '#031d22', '#15091f', '#252731']),
	maxCanvasWidth: 560,
	cameraUpperRatio: 0.38,
	cameraLowerRatio: 0.56,
	cameraRecoveryRatio: 0.18,
	cameraResponse: 0.22
});

export const SOUL_GLYPHS = Object.freeze({
	player: '🔥',
	spark: '✨',
	shatter: '💥',
	stable: '🟫',
	moving: '🟦',
	breakable: '🟥',
	bountiful: '🟨',
	shofar: '🐏',
	magenDavid: '✡️',
	einSof: '☀️',
	klippot: Object.freeze(['👹', '🕷️', '💀']),
	hebrew: Object.freeze(Array.from('אבגדהוזחטיכלמנסעפצקרשת')),
	background: Object.freeze(Array.from('אשהומי✦✡✨'))
});
