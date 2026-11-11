// B"H
// Star Collector — levels: every 20s the level rises and the game speeds up.
window.SC = window.SC || {};

var LEVEL_SECONDS = 20;

function levelForTime(elapsed) {
	return 1 + Math.floor(elapsed / LEVEL_SECONDS);
}

// Speeds in px/second, spawn intervals in seconds (jittered by the spawner).
function levelConfig(level) {
	var l = Math.max(1, level);
	return {
		starSpeed: 110 + (l - 1) * 28,
		meteorSpeed: 150 + (l - 1) * 38,
		shipSpeed: 300 + (l - 1) * 12,
		starInterval: Math.max(0.28, 0.85 - (l - 1) * 0.08),
		meteorInterval: Math.max(0.45, 1.35 - (l - 1) * 0.14)
	};
}

SC.LEVEL_SECONDS = LEVEL_SECONDS;
SC.levelForTime = levelForTime;
SC.levelConfig = levelConfig;
