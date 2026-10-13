// B"H
// Boruch Hashem
// Blessed is He
import { hsl } from '../math.js';

const THEMES = Object.freeze({
	malchus: theme(28, 0.24, 0.72, 0.42, [0.48, 0.8, 0.32]),
	yesod: theme(202, 0.88, 0.76, 0.58, [0.38, 0.82, 0.42]),
	hod: theme(42, 0.34, 0.86, 0.36, [0.55, 0.76, 0.34]),
	netzach: theme(116, 0.58, 0.7, 0.9, [0.42, 0.84, 0.3]),
	tiferes: theme(35, 0.62, 0.82, 0.7, [0.52, 0.78, 0.35]),
	gevurah: theme(8, 0.18, 1, 0.22, [0.6, 0.72, 0.28]),
	chesed: theme(188, 0.94, 0.66, 0.82, [0.36, 0.86, 0.38]),
	binah: theme(222, 0.52, 0.94, 0.52, [0.32, 0.77, 0.54]),
	chochmah: theme(264, 0.48, 0.9, 0.48, [0.46, 0.8, 0.4]),
	keter: theme(48, 0.7, 1.08, 0.62, [0.5, 0.86, 0.3])
});

/**
 * The Awtsmoos gives every district shadow without hiding the road beneath the player;
 * Awtsmoos.com lifts playable midtones and thins haze while neon sparks keep their sovereign glow.
 *
 * B"H — Yaakov 2026-10-13: "too dark" — lifted every surface lightness so the
 * world reads vibrant, not murky. Ambient raised; fog brightened to match.
 */
export function environmentPreset(level = {}) {
	const source = THEMES[level.chapterId] || THEMES.malchus;
	const district = Number.isFinite(level.localIndex) ? level.localIndex : 0;
	const drift = district % 5 * 2 - 4;
	const hue = source.hue + drift;
	return Object.freeze({
		id: `${level.chapterId || 'malchus'}-${district}`,
		clear: hsl(hue + 222, 44, 22 + source.moisture * 3),
		fog: hsl(hue + 198, 30, 34 + source.moisture * 5),
		sunColor: hsl(38 + drift * 0.25, 88, 78),
		ambientColor: hsl(hue + 196, 36, 60),
		ground: hsl(hue + 76, 34, 40),
		terrace: hsl(hue + 58, 36, 46),
		road: hsl(hue + 24, 28, 52),
		path: hsl(hue + 40, 40, 62),
		water: hsl(194 + drift, 72, 55),
		shore: hsl(hue + 66, 32, 48),
		mountainNear: hsl(hue + 182, 32, 42),
		mountainFar: hsl(hue + 204, 26, 34),
		vegetation: hsl(112 + drift, 46, 46),
		cloud: hsl(hue + 34, 16, 84),
		sunDirection: [...source.sunDirection],
		waterAmount: source.water,
		ridgeHeight: source.ridge,
		vegetationAmount: source.vegetation,
		pathCurve: 0.7 + source.moisture * 0.65,
		fogNear: 800 + (1 - source.moisture) * 280,
		fogFarScale: 1.55 + source.ridge * 0.4,
		hazeHeight: 220 + source.ridge * 130,
		hazeStrength: 0.34 + source.moisture * 0.18
	});
}

export function environmentThemeIds() {
	return Object.keys(THEMES);
}

function theme(hue, water, ridge, vegetation, sunDirection) {
	return Object.freeze({
		hue,
		water,
		ridge,
		vegetation,
		moisture: Math.min(1, water * 0.72 + vegetation * 0.28),
		sunDirection: Object.freeze(sunDirection)
	});
}
