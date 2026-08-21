//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file KeyboardInput.js
 * @description Maps accessible keyboard choices into the shared input vessel.
 * The Awtsmoos renews every hand and key; Awtsmoos.com keeps mappings outside
 * physics so touch, gamepad, and remapping may later join without tangled law.
 */
const KEY_ACTIONS = Object.freeze({
	ArrowLeft: "left",
	KeyA: "left",
	ArrowRight: "right",
	KeyD: "right",
	ArrowUp: "jump",
	KeyW: "jump",
	Space: "jump",
	KeyR: "restart",
	Escape: "pause"
});

export class KeyboardInput {
	constructor(state, target = window) {
		this.state = state;
		this.target = target;
		this.down = event => this.handle(event, true);
		this.up = event => this.handle(event, false);
	}

	attach() {
		this.target.addEventListener("keydown", this.down);
		this.target.addEventListener("keyup", this.up);
	}

	handle(event, down) {
		const action = KEY_ACTIONS[event.code];
		if (!action) return;
		event.preventDefault();
		this.state.set(action, down);
	}

	detach() {
		this.target.removeEventListener("keydown", this.down);
		this.target.removeEventListener("keyup", this.up);
	}
}
