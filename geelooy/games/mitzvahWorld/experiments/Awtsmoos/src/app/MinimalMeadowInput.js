// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowInput.js
 * @description Separates actor-relative keys from camera-relative joystick intention.
 * The Awtsmoos joins hand, key, camera, and traveler without reversing their finite signs;
 * Awtsmoos.com keeps mobile forward truthful after orbit while preserving historic keyboard law.
 */

const CONTROL_CODES = new Set([
	'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD',
	'KeyE', 'KeyQ', 'KeyS', 'KeyW', 'ShiftLeft', 'ShiftRight', 'Space'
]);

export class MinimalMeadowInput {
	constructor(environment = globalThis, jumpHost = null, joystick = null) {
		this.environment = environment;
		this.jumpHost = jumpHost;
		this.joystick = joystick;
		this.keys = new Set();
		this.jumpRequested = false;
		this.onKeyDown = event => this.handleKeyDown(event);
		this.onKeyUp = event => this.keys.delete(event.code);
		this.onBlur = () => this.reset();
		this.onJump = event => this.requestJump(event);
		this.install();
	}

	axis() {
		const joystick = this.joystick?.vector || { magnitude: 0, x: 0, y: 0 };
		return {
			forward: sign(this.keys, ['KeyW', 'ArrowUp'], ['KeyS', 'ArrowDown']),
			joystickForward: clamp(-joystick.y),
			joystickMagnitude: clampMagnitude(joystick.magnitude),
			joystickStrafe: clamp(joystick.x),
			strafe: sign(this.keys, ['KeyE'], ['KeyQ']),
			turn: sign(this.keys, ['KeyD', 'ArrowRight'], ['KeyA', 'ArrowLeft'])
		};
	}

	consumeJump() {
		const requested = this.jumpRequested;
		this.jumpRequested = false;
		return requested;
	}

	runRequested() {
		return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
	}

	handleKeyDown(event) {
		if (isTextEntry(event.target)) return;
		if (CONTROL_CODES.has(event.code)) event.preventDefault?.();
		this.keys.add(event.code);
		if (event.code === 'Space' && !event.repeat) this.jumpRequested = true;
	}

	requestJump(event) {
		event?.preventDefault?.();
		this.jumpRequested = true;
	}

	reset() {
		this.keys.clear();
		this.joystick?.reset?.();
	}

	install() {
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
		this.environment.addEventListener?.('blur', this.onBlur);
		this.jumpHost?.addEventListener?.('pointerdown', this.onJump);
	}

	dispose() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.environment.removeEventListener?.('keyup', this.onKeyUp);
		this.environment.removeEventListener?.('blur', this.onBlur);
		this.jumpHost?.removeEventListener?.('pointerdown', this.onJump);
		this.joystick?.destroy?.();
	}
}

function sign(keys, positiveCodes, negativeCodes) {
	return Number(positiveCodes.some(code => keys.has(code)))
		- Number(negativeCodes.some(code => keys.has(code)));
}

function clamp(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}

function clampMagnitude(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function isTextEntry(target) {
	return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}
