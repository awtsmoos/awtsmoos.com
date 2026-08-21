//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews the same little world each instant; Awtsmoos.com keeps
 * its original coordinates in one vessel so responsive display changes no law.
 */
export const tileSize = 40;
export const playerSize = tileSize - 10;
export const playerSpeed = 5;

export const player = {
	x: tileSize + 5,
	y: tileSize + 5,
	width: playerSize,
	height: playerSize,
	color: '#0f0',
	dx: 0,
	dy: 0
};

export const walls = [
	{ x: tileSize * 2, y: tileSize * 2, width: tileSize, height: tileSize * 4 },
	{ x: tileSize * 4, y: tileSize * 3, width: tileSize * 3, height: tileSize }
];

export const coins = [
	{ x: tileSize * 6 + 5, y: tileSize + 5, width: playerSize, height: playerSize, color: '#ff0' },
	{ x: tileSize * 7 + 5, y: tileSize * 4 + 5, width: playerSize, height: playerSize, color: '#ff0' }
];

export const keys = [
	{ x: tileSize * 3 + 5, y: tileSize * 6 + 5, width: playerSize, height: playerSize, color: '#f00' }
];
