/* B"H — Swipe, keyboard, and button input for the runner. */
export function bindInput(player, hooks = {}) {
	const root = document.getElementById('rr-root');
	let gestureFired = false;
	const firstGesture = () => {
		if (!gestureFired) { gestureFired = true; hooks.onFirstGesture && hooks.onFirstGesture(); }
	};

	// --- touch swipe ---
	let sx = 0, sy = 0, tracking = false;
	root.addEventListener('touchstart', (e) => {
		firstGesture();
		if (e.target.closest('button')) return;
		const t = e.touches[0];
		sx = t.clientX; sy = t.clientY; tracking = true;
	}, { passive: true });
	root.addEventListener('touchend', (e) => {
		if (!tracking) return;
		tracking = false;
		const t = e.changedTouches[0];
		const dx = t.clientX - sx, dy = t.clientY - sy;
		if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
		if (Math.abs(dx) > Math.abs(dy)) player.moveLane(dx > 0 ? 1 : -1);
		else if (dy < 0) player.jump();
		else player.slide();
	}, { passive: true });

	// --- mouse drag (desktop testing) ---
	let msx = 0, msy = 0, mDown = false;
	root.addEventListener('mousedown', (e) => {
		if (e.target.closest('button')) return;
		mDown = true; msx = e.clientX; msy = e.clientY;
	});
	addEventListener('mouseup', (e) => {
		if (!mDown) return; mDown = false;
		const dx = e.clientX - msx, dy = e.clientY - msy;
		if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
		if (Math.abs(dx) > Math.abs(dy)) player.moveLane(dx > 0 ? 1 : -1);
		else if (dy < 0) player.jump();
		else player.slide();
	});

	// --- keyboard ---
	addEventListener('keydown', (e) => {
		if (e.repeat) return;
		firstGesture();
		switch (e.code) {
			case 'ArrowLeft': case 'KeyA': player.moveLane(-1); break;
			case 'ArrowRight': case 'KeyD': player.moveLane(1); break;
			case 'ArrowUp': case 'KeyW': case 'Space': player.jump(); e.preventDefault(); break;
			case 'ArrowDown': case 'KeyS': player.slide(); break;
			case 'KeyP': case 'Escape': hooks.onPause && hooks.onPause(); break;
		}
	});

	// --- on-screen buttons ---
	document.querySelectorAll('#rr-controls [data-move]').forEach((b) => {
		b.addEventListener('touchstart', (e) => { e.preventDefault(); firstGesture(); doMove(b.dataset.move); }, { passive: false });
		b.addEventListener('mousedown', (e) => { e.preventDefault(); firstGesture(); doMove(b.dataset.move); });
	});
	function doMove(m) {
		if (m === 'left') player.moveLane(-1);
		else if (m === 'right') player.moveLane(1);
		else if (m === 'jump') player.jump();
		else if (m === 'slide') player.slide();
	}
}
