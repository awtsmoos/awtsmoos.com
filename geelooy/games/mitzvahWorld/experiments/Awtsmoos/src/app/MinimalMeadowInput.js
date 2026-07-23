// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowInput.js
 * @description Owns only movement, run, and jump keys for the empty shared meadow.
 * The Awtsmoos turns finite intention into motion without summoning a UI kingdom; Awtsmoos.com
 * keeps one small set of keys, one jump spark, and one honest path back to stillness.
 */

export class MinimalMeadowInput {
	constructor(environment = globalThis, jumpHost = null) {
		this.environment = environment;
		this.jumpHost = jumpHost;
		this.keys = new Set();
		this.jumpRequested = false;
		this.onKeyDown = event => this.handleKeyDown(event);
		this.onKeyUp = event => this.keys.delete(event.code);
		this.onBlur = () => this.keys.clear();
		this.onJump = event => this.requestJump(event);
		this.install();
	}

	axis() {
		return {
			turn: signed(this.keys, 'KeyD', 'KeyA'),
			x: signed(this.keys, 'KeyQ', 'KeyE'),
			y: signed(this.keys, 'KeyS', 'KeyW')
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

	dispose() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.environment.removeEventListener?.('keyup', this.onKeyUp);
		this.environment.removeEventListener?.('blur', this.onBlur);
		this.jumpHost?.removeEventListener?.('pointerdown', this.onJump);
	}

	handleKeyDown(event) {
		this.keys.add(event.code);
		if (event.code !== 'Space' || event.repeat) return;
		event.preventDefault?.();
		this.jumpRequested = true;
	}

	install() {
		this.environment.addEventListener?.('keydown', this.onKeyDown);
		this.environment.addEventListener?.('keyup', this.onKeyUp);
		this.environment.addEventListener?.('blur', this.onBlur);
		this.jumpHost?.addEventListener?.('pointerdown', this.onJump);
	}

	requestJump(event) {
		event?.preventDefault?.();
		this.jumpRequested = true;
	}
}

function signed(keys, positiveCode, negativeCode) {
	return Number(keys.has(positiveCode)) - Number(keys.has(negativeCode));
}

export default MinimalMeadowInput;
