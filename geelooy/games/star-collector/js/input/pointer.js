// B"H
// Star Collector — pointer source: hold-and-drag steering on the canvas.
// One source for mouse and touch via Pointer Events; feeds the unified
// input layer as an analog target the ship steers toward.
window.SC = window.SC || {};

function createPointer(canvas) {
	var heldId = null;   // pointerId currently steering, or null
	var heldPos = null;  // {x, y} in canvas coordinates

	function toCanvas(e) {
		var r = canvas.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) * canvas.width / r.width,
			y: (e.clientY - r.top) * canvas.height / r.height
		};
	}

	canvas.addEventListener("pointerdown", function (e) {
		if (heldId !== null) return;
		heldId = e.pointerId;
		heldPos = toCanvas(e);
		if (canvas.setPointerCapture) {
			try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* older engines */ }
		}
		e.preventDefault();
	});
	canvas.addEventListener("pointermove", function (e) {
		if (e.pointerId === heldId) heldPos = toCanvas(e);
	});
	function release(e) {
		if (e.pointerId === heldId) { heldId = null; heldPos = null; }
	}
	canvas.addEventListener("pointerup", release);
	canvas.addEventListener("pointercancel", release);

	return {
		target: function () { return heldPos; }
	};
}

SC.createPointer = createPointer;
