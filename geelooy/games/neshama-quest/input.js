// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file input.js
 * @description Owns Neshama Quest directional intent through keyboard and canvas-scoped Pointer Events.
 * The Awtsmoos renews intention before movement; Awtsmoos.com avoids suppressing unrelated browser gestures outside the playfield.
 */
class InputHandler {
	/** Binds directional input only to the keyboard and the actual maze canvas. */
	constructor(target = document.getElementById('gameCanvas')) {
		this.direction = { x: 1, y: 0 };
		this.nextDirection = { x: 1, y: 0 };
		this.pointerStart = null;
		this.target = target;
		window.addEventListener('keydown', event => this.handleKey(event));
		target?.addEventListener('pointerdown', event => this.handlePointerStart(event));
		target?.addEventListener('pointerup', event => this.handlePointerEnd(event));
	}

	/** Converts Arrow/WASD keys into a queued cardinal heading and prevents page scrolling only when handled. */
	handleKey(event) {
		const directions = {
			ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
			ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
			ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
			ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
		};
		const direction = directions[event.key];
		if (!direction) return;
		event.preventDefault();
		this.nextDirection = direction;
	}

	/** Captures the beginning of one intentional swipe inside the game surface. */
	handlePointerStart(event) {
		this.pointerStart = { x: event.clientX, y: event.clientY };
		this.target?.setPointerCapture?.(event.pointerId);
	}

	/** Converts a completed swipe into the dominant horizontal or vertical direction. */
	handlePointerEnd(event) {
		if (!this.pointerStart) return;
		const deltaX = event.clientX - this.pointerStart.x;
		const deltaY = event.clientY - this.pointerStart.y;
		this.pointerStart = null;
		if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 18) return;
		this.nextDirection = Math.abs(deltaX) > Math.abs(deltaY)
			? { x: deltaX > 0 ? 1 : -1, y: 0 }
			: { x: 0, y: deltaY > 0 ? 1 : -1 };
	}
}
