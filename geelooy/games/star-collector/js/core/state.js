// B"H
// Star Collector — state factory and reset.
window.SC = window.SC || {};

function createState(width, height) {
	return {
		width: width,
		height: height,
		running: true,
		paused: false,     // unified input layer pause (key, button, visibility)
		over: false,
		score: 0,
		lives: 3,
		elapsed: 0,        // seconds survived this run
		level: 1,
		stars: [],
		meteors: [],
		starTimer: 0,      // seconds until next star spawn
		meteorTimer: 0,    // seconds until next meteor spawn
		invincible: 0,     // seconds of post-hit invincibility left
		ship: null         // filled by SC.createShip
	};
}

function resetState(state) {
	var fresh = createState(state.width, state.height);
	for (var key in fresh) state[key] = fresh[key];
	state.ship = SC.createShip(state);
	return state;
}

SC.createState = createState;
SC.resetState = resetState;
