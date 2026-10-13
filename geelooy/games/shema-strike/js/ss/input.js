//B"H
// Boruch Hashem
// Blessed is He
/* B"H — Input: keyboard, swipe, and on-screen buttons for the platformer. */
export function bindInput(player, strike, hooks = {}) {
	const root = document.getElementById('ss-root');
	let gestureFired = false;
	const firstGesture = () => {
		if (!gestureFired) { gestureFired = true; hooks.onFirstGesture && hooks.onFirstGesture(); }
	};

	const keys = { left: false, right: false };
	function applyKeys() {
		player.setMove((keys.right ? 1 : 0) - (keys.left ? 1 : 0));
	}

	// --- touch swipe ---
	let sx = 0, sy = 0, tracking = false;
	root.addEventListener('touchstart', (e) => {
		firstGesture();
		if (e.target.closest('button')) return;
		const t = e.touches[0];
		sx = t.clientX; sy = t.clientY; tracking = true;
	}, { passive: true });
	root.addEventListener('touchmove', (e) => {
		if (!tracking) return;
		const t = e.touches[0];
		const dx = t.clientX - sx;
		if (Math.abs(dx) > 18) player.setMove(dx > 0 ? 1 : -1);
		else player.setMove(0);
	}, { passive: true });
	root.addEventListener('touchend', (e) => {
		if (!tracking) return;
		tracking = false;
		const t = e.changedTouches[0];
		const dx = t.clientX - sx, dy = t.clientY - sy;
		if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { player.setMove(0); return; }
		if (Math.abs(dx) > Math.abs(dy)) { /* lane already applied during move */ }
		else if (dy < -24) player.queueJump();
		else if (dy > 24) strike();
		player.setMove(0);
	}, { passive: true });

	// --- mouse drag (desktop) ---
	let mDown = false, msx = 0, msy = 0;
	root.addEventListener('mousedown', (e) => {
		if (e.target.closest('button')) return;
		mDown = true; msx = e.clientX; msy = e.clientY;
	});
	addEventListener('mouseup', (e) => {
		if (!mDown) return; mDown = false;
		const dx = e.clientX - msx, dy = e.clientY - msy;
		if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
		if (dy < -24) player.queueJump();
	});

	// --- keyboard ---
	addEventListener('keydown', (e) => {
		if (e.repeat) return;
		firstGesture();
		switch (e.code) {
			case 'ArrowLeft': case 'KeyA': keys.left = true; applyKeys(); break;
			case 'ArrowRight': case 'KeyD': keys.right = true; applyKeys(); break;
			case 'ArrowUp': case 'KeyW': case 'Space': player.queueJump(); e.preventDefault(); break;
			case 'KeyJ': case 'KeyX': case 'KeyF': strike(); break;
			case 'KeyP': case 'Escape': hooks.onPause && hooks.onPause(); break;
		}
	});
	addEventListener('keyup', (e) => {
		switch (e.code) {
			case 'ArrowLeft': case 'KeyA': keys.left = false; applyKeys(); break;
			case 'ArrowRight': case 'KeyD': keys.right = false; applyKeys(); break;
		}
	});

	// --- on-screen buttons ---
	const held = {};
	document.querySelectorAll('#ss-controls [data-move]').forEach((b) => {
		const m = b.dataset.move;
		const down = (e) => { e.preventDefault(); firstGesture();
			if (m === 'left') player.setMove(-1);
			else if (m === 'right') player.setMove(1);
			else if (m === 'jump') player.queueJump();
			else if (m === 'strike') strike();
			held[m] = true;
		};
		const up = (e) => { if (e) e.preventDefault();
			held[m] = false;
			if ((m === 'left' || m === 'right') && !held.left && !held.right) player.setMove(0);
		};
		b.addEventListener('touchstart', down, { passive: false });
		b.addEventListener('touchend', up, { passive: false });
		b.addEventListener('touchcancel', up, { passive: false });
		b.addEventListener('mousedown', down);
		b.addEventListener('mouseup', up);
		b.addEventListener('mouseleave', up);
	});
}
