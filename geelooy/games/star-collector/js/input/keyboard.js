// B"H
// Star Collector — keyboard input: arrow keys or WASD.
window.SC = window.SC || {};

function createKeyboard() {
	var keys = {};
	var watched = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
		"a", "d", "w", "s", "A", "D", "W", "S"];
	window.addEventListener("keydown", function (e) {
		if (watched.indexOf(e.key) !== -1) {
			keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true;
			if (e.key.indexOf("Arrow") === 0) e.preventDefault();
		}
	});
	window.addEventListener("keyup", function (e) {
		keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false;
	});
	return {
		left: function () { return !!(keys.ArrowLeft || keys.a); },
		right: function () { return !!(keys.ArrowRight || keys.d); },
		up: function () { return !!(keys.ArrowUp || keys.w); },
		down: function () { return !!(keys.ArrowDown || keys.s); }
	};
}

SC.createKeyboard = createKeyboard;
