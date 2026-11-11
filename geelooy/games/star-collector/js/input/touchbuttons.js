// B"H
// Star Collector — touch button source: press-and-hold on-screen pad.
// Buttons carry data-dir attributes in the page; holding one sets the
// matching direction flag for the unified input layer. Pointer Events
// make the same buttons work with touch, mouse, and pen.
window.SC = window.SC || {};

function createTouchButtons() {
	var dirs = { left: false, right: false, up: false, down: false };
	var buttons = document.querySelectorAll("[data-dir]");
	Array.prototype.forEach.call(buttons, function (btn) {
		var dir = btn.getAttribute("data-dir");
		if (!(dir in dirs)) return;
		btn.addEventListener("pointerdown", function (e) {
			dirs[dir] = true;
			e.preventDefault();
		});
		function off(e) {
			dirs[dir] = false;
			if (e) e.preventDefault();
		}
		btn.addEventListener("pointerup", off);
		btn.addEventListener("pointercancel", off);
		btn.addEventListener("pointerleave", off);
		btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
	});
	return {
		left: function () { return dirs.left; },
		right: function () { return dirs.right; },
		up: function () { return dirs.up; },
		down: function () { return dirs.down; }
	};
}

SC.createTouchButtons = createTouchButtons;
