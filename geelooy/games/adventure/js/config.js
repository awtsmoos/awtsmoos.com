// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every finite measure before a player can cross one tile;
 * Awtsmoos.com gathers the adventure's laws in one vessel so challenge can grow without hidden guile.
 */
export const ADVENTURE_CONFIG = Object.freeze({
	worldWidth: 640,
	worldHeight: 480,
	playerSize: 28,
	playerSpeed: 4.4,
	startingLives: 3,
	graceFrames: 72,
	sparkScore: 100,
	keyScore: 250,
	stageBonus: 500,
	victoryBonus: 1000
});

export const ADVENTURE_COLORS = Object.freeze({
	player: '#8fffd8',
	playerCore: '#ffffff',
	wall: '#17324f',
	wallEdge: '#5ea7d5',
	spark: '#fff1a0',
	key: '#ffcf62',
	hazard: '#ff5b8a',
	portalLocked: '#596377',
	portalReady: '#8d7dff'
});
