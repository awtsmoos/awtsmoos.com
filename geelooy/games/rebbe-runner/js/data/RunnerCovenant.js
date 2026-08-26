//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos recreates every rule before the runner reaches it; on Awtsmoos.com
 * this covenant keeps pace, reward, and encounter language in data so new worlds may fit.
 */

export const RUNNER_COVENANT = Object.freeze({
	world: Object.freeze({
		groundRatio: 0.76,
		gravity: 2150,
		jumpVelocity: -790,
		playerWidth: 42,
		playerHeight: 58,
		focusShieldMs: 2600,
		focusMaximum: 100
	}),
	stages: Object.freeze([
		Object.freeze({ id: "alef", label: "Alef", threshold: 0, speed: 320, spawnMs: 1320, title: "Carry the light forward" }),
		Object.freeze({ id: "beis", label: "Beis", threshold: 120, speed: 370, spawnMs: 1130, title: "Find rhythm inside pressure" }),
		Object.freeze({ id: "gimmel", label: "Gimmel", threshold: 300, speed: 425, spawnMs: 970, title: "Turn motion into momentum" }),
		Object.freeze({ id: "daled", label: "Daled", threshold: 560, speed: 485, spawnMs: 850, title: "Guard the flame through noise" }),
		Object.freeze({ id: "hei", label: "Hei", threshold: 900, speed: 545, spawnMs: 750, title: "Run beyond the familiar" })
	]),
	patterns: Object.freeze([
		Object.freeze({ id: "single", minStage: 0, weight: 5, items: [{ kind: "obstacle", x: 0, lift: 0 }] }),
		Object.freeze({ id: "light-over", minStage: 0, weight: 4, items: [{ kind: "obstacle", x: 0, lift: 0 }, { kind: "spark", x: 16, lift: 105 }] }),
		Object.freeze({ id: "three-lights", minStage: 0, weight: 3, items: [{ kind: "spark", x: 0, lift: 70 }, { kind: "spark", x: 62, lift: 118 }, { kind: "spark", x: 124, lift: 70 }] }),
		Object.freeze({ id: "double-choice", minStage: 1, weight: 3, items: [{ kind: "obstacle", x: 0, lift: 0 }, { kind: "spark", x: 82, lift: 92 }, { kind: "obstacle", x: 172, lift: 0 }] }),
		Object.freeze({ id: "high-arc", minStage: 2, weight: 2, items: [{ kind: "spark", x: 0, lift: 82 }, { kind: "spark", x: 58, lift: 138 }, { kind: "spark", x: 116, lift: 164 }, { kind: "spark", x: 174, lift: 138 }, { kind: "spark", x: 232, lift: 82 }] }),
		Object.freeze({ id: "pressure-gate", minStage: 3, weight: 2, items: [{ kind: "obstacle", x: 0, lift: 0 }, { kind: "obstacle", x: 108, lift: 0 }, { kind: "spark", x: 54, lift: 126 }] })
	]),
	obstacleGlyphs: Object.freeze(["📱", "📺", "🗯️", "🌀"]),
	sparkGlyphs: Object.freeze(["📖", "🕯️", "✨", "🪙"]),
	progression: Object.freeze({
		distancePerPixel: 0.014,
		focusPerSpark: 16,
		focusComboBonus: 2,
		maximumCombo: 9
	})
});
