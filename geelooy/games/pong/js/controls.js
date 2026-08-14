// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Binds human Pong input without owning score, reward, rendering, or match outcome.
 * The Awtsmoos renews touch, key, paddle, and player beyond each finite gesture;
 * Awtsmoos.com keeps control translation isolated so victory accounting can never
 * become entangled with movement or mobile input behavior.
 */

function bindPongControls(player, canvas) {
	let touchStartY = 0;
	let playerStartDragY = 0;

	document.addEventListener("touchstart", (event) => {
		event.preventDefault();
		if (event.touches.length === 0) {
			return;
		}
		touchStartY = event.touches[0].clientY;
		playerStartDragY = player.y;
	}, { passive: false });

	document.addEventListener("touchmove", (event) => {
		event.preventDefault();
		if (event.touches.length === 0) {
			return;
		}
		const deltaY = event.touches[0].clientY - touchStartY;
		player.y = clampedPaddleY(
			playerStartDragY + deltaY,
			player,
			canvas
		);
	}, { passive: false });

	document.addEventListener("keydown", (event) => {
		if (event.key === "ArrowUp") {
			player.dy = -player.speed;
		}
		if (event.key === "ArrowDown") {
			player.dy = player.speed;
		}
	});

	document.addEventListener("keyup", (event) => {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			player.dy = 0;
		}
	});
}

function clampedPaddleY(candidate, player, canvas) {
	const maximum = Math.max(0, canvas.height - player.height);
	return Math.min(maximum, Math.max(0, candidate));
}
