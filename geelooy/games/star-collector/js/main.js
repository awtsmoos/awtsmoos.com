// B"H
// Star Collector — boot: wire state, input, ui, loop. Test surface: SC.state.
window.SC = window.SC || {};

function bootStarCollector() {
	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");
	var state = SC.createState(canvas.width, canvas.height);
	state.ship = SC.createShip(state);
	SC.state = state; // exposed for the browser play test

	function setPaused(v) {
		state.paused = !!v && !state.over;
		if (input) input.setPaused(state.paused);
	}
	var input = SC.createInput(canvas, {
		onPauseToggle: function () { setPaused(!state.paused); },
		onAutoPause: function () { setPaused(true); }
	});
	SC.input = input; // exposed for the browser play test
	var backdrop = SC.createBackdrop(state);
	var hud = SC.createHud();
	var game = SC.createGame(state, input, backdrop);
	var screens = SC.createScreens(function () {
		SC.resetState(state);
		input.setPaused(false);
		screens.hideGameOver();
		hud.update(state);
	});
	SC.screens = screens;

	var last = null;
	var shownOver = false;
	function frame(ts) {
		if (last === null) last = ts;
		var dt = Math.min(0.05, (ts - last) / 1000);
		last = ts;
		game.update(dt);
		SC.drawFrame(ctx, state, backdrop);
		hud.update(state);
		if (state.over && !shownOver) {
			screens.showGameOver(state);
			shownOver = true;
		}
		if (!state.over) shownOver = false;
		requestAnimationFrame(frame);
	}
	hud.update(state);
	requestAnimationFrame(frame);
}

bootStarCollector();
