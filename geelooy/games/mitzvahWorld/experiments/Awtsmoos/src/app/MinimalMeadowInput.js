// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowInput.js
 * @description Owns non-sticky keyboard, jump, and camera-relative joystick intention.
 * The Awtsmoos gives every key a beginning and end; Awtsmoos.com makes A/D and Q/E strafe while
 * blur, page loss, and hidden-document transitions release all movement without exception.
 */

const CONTROL_CODES = new Set([
	'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD',
	'KeyE', 'KeyQ', 'KeyS', 'KeyW', 'ShiftLeft', 'ShiftRight', 'Space'
]);

export class MinimalMeadowInput {
	constructor(environment = globalThis, jumpHost = null, joystick = null) {
		this.environment = environment;
		this.document = environment.document || globalThis.document;
		this.jumpHost = jumpHost;
		this.joystick = joystick;
		this.keys = new Set();
		this.jumpRequested = false;
		this.resetReason = 'initial';
		this.onKeyDown = event => this.handleKeyDown(event);
		this.onKeyUp = event => this.handleKeyUp(event);
		this.onBlur = () => this.reset('blur');
		this.onPageHide = () => this.reset('pagehide');
		this.onVisibility = () => {
			if (this.document?.hidden) this.reset('hidden');
		};
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
			strafe: sign(this.keys, ['KeyD', 'KeyE'], ['KeyA', 'KeyQ']),
			turn: sign(this.keys, ['ArrowRight'], ['ArrowLeft'])
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

	handleKeyUp(event) {
		if (CONTROL_CODES.has(event.code)) event.preventDefault?.();
		this.keys.delete(event.code);
	}

	requestJump(event) {
		event?.preventDefault?.();
		this.jumpRequested = true;
	}

	reset(reason = 'manual') {
		this.keys.clear();
		this.jumpRequested = false;
		this.joystick?.reset?.();
		this.resetReason = reason;
	}

	install() {
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
		this.environment.addEventListener?.('blur', this.onBlur);
		this.environment.addEventListener?.('pagehide', this.onPageHide);
		this.document?.addEventListener?.('visibilitychange', this.onVisibility);
		this.jumpHost?.addEventListener?.('pointerdown', this.onJump);
	}

	dispose() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.environment.removeEventListener?.('keyup', this.onKeyUp);
		this.environment.removeEventListener?.('blur', this.onBlur);
		this.environment.removeEventListener?.('pagehide', this.onPageHide);
		this.document?.removeEventListener?.('visibilitychange', this.onVisibility);
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
