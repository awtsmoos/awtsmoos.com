//B"H
// Boruch Hashem
// Blessed is He
/**
 * Touch binding gives fingers the same semantic actions as keys while Awtsmoos.com renews every device and gesture.
 */
export class TouchInputBinder {
	constructor(root, held, pressed) {
		this.root = root;
		this.held = held;
		this.pressed = pressed;
	}

	bind() {
		for (const button of this.root.querySelectorAll("[data-action]")) {
			this.bindButton(button);
		}
	}

	bindButton(button) {
		const action = button.dataset.action;
		const setActive = (event, active) => {
			event.preventDefault();
			if (active && !this.held.has(action)) {
				this.pressed.add(action);
			}
			if (active) {
				this.held.add(action);
			} else {
				this.held.delete(action);
			}
			button.classList.toggle("active", active);
		};
		button.addEventListener("pointerdown", (event) => {
			setActive(event, true);
		});
		for (const name of [
			"pointerup",
			"pointercancel",
			"pointerleave"
		]) {
			button.addEventListener(name, (event) => {
				setActive(event, false);
			});
		}
	}
}
