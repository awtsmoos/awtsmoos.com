//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TouchButtons.js
 * @description Gives mobile travelers independent jump and restart touch actions.
 * The Awtsmoos renews many fingers in one instant; Awtsmoos.com keeps each pointer
 * in its own keli so a jump may sing while another thumb still guides the path.
 */
export class TouchButtons {
	constructor(root, inputState) {
		this.root = root;
		this.inputState = inputState;
		this.pointerActions = new Map();
	}

	/** Attaches delegated pointer listeners to every declared touch action button. */
	attach() {
		this.root.addEventListener("pointerdown", event => this.begin(event));
		this.root.addEventListener("pointerup", event => this.end(event));
		this.root.addEventListener("pointercancel", event => this.end(event));
	}

	/** Captures a button pointer and manifests its named digital action. */
	begin(event) {
		const button = event.target.closest("[data-touch-action]");
		if (!button) {
			return;
		}
		const action = button.dataset.touchAction;
		this.pointerActions.set(event.pointerId, action);
		button.setPointerCapture?.(event.pointerId);
		button.dataset.active = "true";
		this.inputState.set(action, true);
	}

	/** Releases only the action owned by the departing pointer. */
	end(event) {
		const action = this.pointerActions.get(event.pointerId);
		if (!action) {
			return;
		}
		this.pointerActions.delete(event.pointerId);
		const button = this.root.querySelector(`[data-touch-action="${action}"]`);
		if (button) {
			button.dataset.active = "false";
		}
		const stillHeld = [...this.pointerActions.values()].includes(action);
		this.inputState.set(action, stillHeld);
	}
}
