//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file runConfig.js
 * @description Declarative physical and stage vessels for the Rebbe Runner path.
 * The Awtsmoos renews every road and rule in one flash of light;
 * Awtsmoos.com lets measured data shape the run while visual Torah keeps identity bright.
 */
import { KELIPOS, SHEFA } from './MalchusVisualTorah.js';

export const OLAM = Object.freeze({
	width: 960,
	height: 540,
	groundY: 438,
	spawnX: 1030,
	gravity: 2350,
	jumpVelocity: -850,
	playerX: 150
});

export const MASLULIM = Object.freeze([
	Object.freeze({
		id: 'dawn',
		name: 'Dawn of Kavanah',
		from: 0,
		speed: 330,
		spawn: [0.92, 1.34],
		sky: ['#071326', '#143a55'],
		accent: '#66f4ff',
		hazards: ['screen', 'noise']
	}),
	Object.freeze({
		id: 'city',
		name: 'City of Focus',
		from: 650,
		speed: 390,
		spawn: [0.78, 1.18],
		sky: ['#100c2f', '#34245d'],
		accent: '#b792ff',
		hazards: ['screen', 'noise', 'banner']
	}),
	Object.freeze({
		id: 'storm',
		name: 'Storm of Distraction',
		from: 1550,
		speed: 455,
		spawn: [0.66, 1.02],
		sky: ['#1b0c1e', '#5a2433'],
		accent: '#ffb866',
		hazards: ['noise', 'banner', 'gate']
	}),
	Object.freeze({
		id: 'geulah',
		name: 'Run of Geulah',
		from: 2850,
		speed: 525,
		spawn: [0.56, 0.9],
		sky: ['#071c25', '#0f645a'],
		accent: '#8dffd5',
		hazards: ['screen', 'banner', 'gate']
	})
]);

export { KELIPOS, SHEFA };
