// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos turns key and fingertip into one finite intention; Awtsmoos.com keeps movement, pause, and return in a single disciplined translation.
 */
export class AdventureInput {
	constructor(world, options = {}) {
		this.world = world;
		this.onRestart = options.onRestart || (() => world.restart());
		this.onPause = options.onPause || (() => world.togglePause());
		this.held = new Set();
		this.keyDirections = new Map([
			['ArrowUp', 'up'], ['w', 'up'], ['W', 'up'],
			['ArrowDown', 'down'], ['s', 'down'], ['S', 'down'],
			['ArrowLeft', 'left'], ['a', 'left'], ['A', 'left'],
			['ArrowRight', 'right'], ['d', 'right'], ['D', 'right']
		]);
		this.bind();
	}

	bind() {
		document.addEventListener('keydown', event => this.keyDown(event));
		document.addEventListener('keyup', event => this.keyUp(event));
		document.querySelectorAll('[data-direction]').forEach(button => this.bindDirectionButton(button));
		document.getElementById('pauseButton')?.addEventListener('click', () => this.onPause());
		document.getElementById('restartButton')?.addEventListener('click', () => this.restart());
		document.getElementById('overlayRestart')?.addEventListener('click', () => this.restart());
		window.addEventListener('blur', () => this.clear());
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) this.clear();
		});
	}

	keyDown(event) {
		if (event.repeat && ['p', 'P', 'r', 'R'].includes(event.key)) return;
		if (event.key === 'p' || event.key === 'P') {
			event.preventDefault();
			this.onPause();
			return;
		}
		if (event.key === 'r' || event.key === 'R') {
			event.preventDefault();
			this.restart();
			return;
		}
		const direction = this.keyDirections.get(event.key);
		if (!direction) return;
		event.preventDefault();
		this.held.add(direction);
		this.syncVelocity();
	}

	keyUp(event) {
		const direction = this.keyDirections.get(event.key);
		if (!direction) return;
		this.held.delete(direction);
		this.syncVelocity();
	}

	bindDirectionButton(button) {
		const direction = button.dataset.direction;
		button.addEventListener('pointerdown', event => {
			event.preventDefault();
			button.setPointerCapture?.(event.pointerId);
			button.classList.add('is-active');
			this.held.add(direction);
			this.syncVelocity();
		});
		const release = event => {
			button.classList.remove('is-active');
			this.held.delete(direction);
			this.syncVelocity();
			if (button.hasPointerCapture?.(event.pointerId)) button.releasePointerCapture(event.pointerId);
		};
		button.addEventListener('pointerup', release);
		button.addEventListener('pointercancel', release);
		button.addEventListener('lostpointercapture', () => {
			this.held.delete(direction);
			this.syncVelocity();
		});
	}

	syncVelocity() {
		const speed = this.world.config.playerSpeed;
		this.world.player.dx = (Number(this.held.has('right')) - Number(this.held.has('left'))) * speed;
		this.world.player.dy = (Number(this.held.has('down')) - Number(this.held.has('up'))) * speed;
	}

	clear() {
		this.held.clear();
		document.querySelectorAll('.dpad-button.is-active').forEach(button => button.classList.remove('is-active'));
		this.syncVelocity();
	}

	restart() {
		this.clear();
		this.onRestart();
	}
}
