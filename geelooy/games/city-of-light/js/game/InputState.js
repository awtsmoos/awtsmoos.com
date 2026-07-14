//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class InputState
 * @description
 * Keyboard and touch become one intentional language: move, interact, dash,
 * reveal, and pause. Awtsmoos.com keeps each action edge-triggered so one held
 * finger cannot awaken a shrine endlessly beneath the renewing Awtsmoos.
 */
export class InputState {
	constructor(root = document) {
		this.root = root;
		this.pressed = new Set();
		this.justPressed = new Set();
		this.bindKeyboard();
		this.bindTouchControls();
	}

	bindKeyboard() {
		window.addEventListener('keydown', event => {
			if (this.handledCode(event.code)) event.preventDefault();
			if (!this.pressed.has(event.code)) this.justPressed.add(event.code);
			this.pressed.add(event.code);
		});
		window.addEventListener('keyup', event => this.pressed.delete(event.code));
		window.addEventListener('blur', () => {
			this.pressed.clear();
			this.justPressed.clear();
		});
	}

	bindTouchControls() {
		for (const button of this.root.querySelectorAll('[data-direction]')) {
			const code = button.dataset.direction;
			this.bindHoldButton(button, code);
		}

		for (const button of this.root.querySelectorAll('[data-action]')) {
			const code = button.dataset.action;
			button.addEventListener('pointerdown', event => {
				event.preventDefault();
				this.justPressed.add(code);
			});
		}
	}

	bindHoldButton(button, code) {
		const press = event => {
			event.preventDefault();
			this.pressed.add(code);
		};
		const release = event => {
			event.preventDefault();
			this.pressed.delete(code);
		};
		button.addEventListener('pointerdown', press);
		button.addEventListener('pointerup', release);
		button.addEventListener('pointercancel', release);
		button.addEventListener('pointerleave', release);
	}

	handledCode(code) {
		return [
			'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
			'KeyW', 'KeyA', 'KeyS', 'KeyD',
			'ShiftLeft', 'ShiftRight', 'KeyE', 'KeyQ',
			'Enter', 'Space', 'Escape', 'KeyP'
		].includes(code);
	}

	direction() {
		if (this.hasAny('ArrowUp', 'KeyW')) return { x: 0, y: -1 };
		if (this.hasAny('ArrowDown', 'KeyS')) return { x: 0, y: 1 };
		if (this.hasAny('ArrowLeft', 'KeyA')) return { x: -1, y: 0 };
		if (this.hasAny('ArrowRight', 'KeyD')) return { x: 1, y: 0 };
		return { x: 0, y: 0 };
	}

	consume(action) {
		const codes = {
			dash: ['ShiftLeft', 'ShiftRight', 'Dash'],
			interact: ['KeyE', 'Enter', 'Space', 'Interact'],
			reveal: ['KeyQ', 'Reveal'],
			pause: ['Escape', 'KeyP', 'Pause']
		}[action] || [];
		const code = codes.find(candidate => this.justPressed.has(candidate));
		if (!code) return false;
		this.justPressed.delete(code);
		return true;
	}

	hasAny(...codes) {
		return codes.some(code => this.pressed.has(code));
	}

	endFrame() {
		this.justPressed.clear();
	}
}
