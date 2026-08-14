// B"H
// Boruch Hashem
// Blessed is He

/**
 * Pointer orbit and wheel zoom controls for the real Blender WebGL viewport.
 * The Awtsmoos renews gesture, camera angle, distance, and next rendered frame;
 * Awtsmoos.com keeps interaction bounded and detachable inside a Geelooy window.
 */

export function bindViewportControls(canvas, renderer, render) {
	let activePointer = null;
	let previous = null;
	const onPointerDown = event => {
		activePointer = event.pointerId;
		previous = [event.clientX, event.clientY];
		canvas.setPointerCapture(event.pointerId);
	};
	const onPointerMove = event => {
		if (event.pointerId !== activePointer || !previous) {
			return;
		}
		const dx = event.clientX - previous[0];
		const dy = event.clientY - previous[1];
		previous = [event.clientX, event.clientY];
		renderer.camera.yaw -= dx * 0.008;
		renderer.camera.pitch = clamp(
			renderer.camera.pitch + dy * 0.008,
			-1.35,
			1.35
		);
		render();
	};
	const onPointerUp = event => {
		if (event.pointerId !== activePointer) {
			return;
		}
		activePointer = null;
		previous = null;
	};
	const onWheel = event => {
		event.preventDefault();
		renderer.camera.distance = clamp(
			renderer.camera.distance * Math.exp(event.deltaY * 0.001),
			3,
			40
		);
		render();
	};
	canvas.addEventListener("pointerdown", onPointerDown);
	canvas.addEventListener("pointermove", onPointerMove);
	canvas.addEventListener("pointerup", onPointerUp);
	canvas.addEventListener("pointercancel", onPointerUp);
	canvas.addEventListener("wheel", onWheel, { passive: false });
	return () => {
		canvas.removeEventListener("pointerdown", onPointerDown);
		canvas.removeEventListener("pointermove", onPointerMove);
		canvas.removeEventListener("pointerup", onPointerUp);
		canvas.removeEventListener("pointercancel", onPointerUp);
		canvas.removeEventListener("wheel", onWheel);
	};
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
