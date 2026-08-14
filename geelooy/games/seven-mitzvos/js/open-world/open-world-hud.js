//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file open-world-hud.js
 * @description
 * The Awtsmoos renews guidance as one nearby invitation rather than a wall of choices;
 * Awtsmoos.com keeps movement at the edges, context in one vessel, and disabled world actions visibly honest.
 * This HUD projects state only and converts touch direction into the same continuous movement intent.
 */
export class OpenWorldHud {
	constructor(root, callbacks = {}) {
		this.root = root;
		this.callbacks = callbacks;
		this.activeDirections = new Set();
		this.cleanups = [];
		this.elements = this.collect(root);
	}

	mount() {
		for (const button of this.elements.directions) {
			this.bindDirection(button);
		}
		const interact = () => this.callbacks.onInteract?.();
		this.elements.interact.addEventListener('click', interact);
		this.cleanups.push(() => this.elements.interact.removeEventListener('click', interact));
		this.context(null);
	}

	/** Projects one world context without changing any domain state. */
	context(value) {
		this.elements.context.hidden = !value;
		if (!value) {
			this.elements.interact.disabled = true;
			return;
		}
		this.elements.title.textContent = value.title;
		this.elements.text.textContent = value.text;
		this.elements.interact.textContent = value.label;
		this.elements.interact.disabled = Boolean(value.disabled);
	}

	release() {
		this.activeDirections.clear();
		this.emitDirection();
	}

	destroy() {
		this.release();
		for (const cleanup of this.cleanups.splice(0)) {
			cleanup();
		}
	}

	bindDirection(button) {
		const direction = button.dataset.worldDirection;
		const press = event => {
			event.preventDefault();
			button.setPointerCapture?.(event.pointerId);
			this.activeDirections.add(direction);
			this.emitDirection();
		};
		const release = event => {
			event.preventDefault();
			this.activeDirections.delete(direction);
			this.emitDirection();
		};
		button.addEventListener('pointerdown', press);
		for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
			button.addEventListener(type, release);
		}
		this.cleanups.push(() => {
			button.removeEventListener('pointerdown', press);
			for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
				button.removeEventListener(type, release);
			}
		});
	}

	emitDirection() {
		const x = Number(this.activeDirections.has('right')) - Number(this.activeDirections.has('left'));
		const z = Number(this.activeDirections.has('down')) - Number(this.activeDirections.has('up'));
		this.callbacks.onDirection?.(x, z);
	}

	collect(root) {
		return {
			context: root.querySelector('#worldContext'),
			title: root.querySelector('#worldContextTitle'),
			text: root.querySelector('#worldContextText'),
			interact: root.querySelector('#worldInteract'),
			directions: [...root.querySelectorAll('[data-world-direction]')]
		};
	}
}
