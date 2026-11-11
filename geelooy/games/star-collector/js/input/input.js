// B"H
// Star Collector — THE unified input layer (Universal Controls Law).
// Every input source — keyboard, pointer drag on the canvas, on-screen
// touch pad — merges here into the one input state the game loop reads:
// direction accessors plus an analog pointer target. Pause also lives
// here: P / Escape key, the on-screen pause button, and auto-pause when
// the page loses visibility all call back through this one layer.
// Naming note: locals here avoid engine-global names (keyboard, mouse,
// page, probe), which the Merkava executor exposes to page code; a local
// named "keyboard" would shadow the executor's own keyboard object.

window.SC = window.SC || {};

function createInput(canvas, opts) {
	opts = opts || {};
	var keySource = SC.createKeyboard();
	var pointer = SC.createPointer(canvas);
	var pad = SC.createTouchButtons();
	var pauseButton = document.getElementById("pause");

	if (pauseButton && opts.onPauseToggle) {
		pauseButton.addEventListener("click", function () { opts.onPauseToggle(); });
	}
	window.addEventListener("keydown", function (e) {
		if ((e.key === "p" || e.key === "P" || e.key === "Escape") && opts.onPauseToggle) {
			opts.onPauseToggle();
		}
	});
	document.addEventListener("visibilitychange", function () {
		if (document.hidden && opts.onAutoPause) opts.onAutoPause();
	});

	return {
		left: function () { return keySource.left() || pad.left(); },
		right: function () { return keySource.right() || pad.right(); },
		up: function () { return keySource.up() || pad.up(); },
		down: function () { return keySource.down() || pad.down(); },
		target: function () { return pointer.target(); },
		setPaused: function (paused) {
			if (pauseButton) pauseButton.textContent = paused ? "▶ Resume" : "⏸ Pause";
		}
	};
}

SC.createInput = createInput;
