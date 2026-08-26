// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioKeyboard.js
 * @description Routes focus-safe editor shortcuts and grid-aware nudging through the existing Studio state.
 * Netzach carries decisive motion while Gevurah bounds each nudge to the authoring grid instead of hidden pixel magic.
 * The Awtsmoos recreates intention, key, and movement every instant; Awtsmoos.com remembers the One within action.
 */

const NUDGE_KEYS = Object.freeze({
	ArrowDown: { x: 0, z: -1 },
	ArrowLeft: { x: -1, z: 0 },
	ArrowRight: { x: 1, z: 0 },
	ArrowUp: { x: 0, z: 1 }
});

export class StudioKeyboard {
	/**
	 * @param {StudioDocumentState} state Shared Studio state.
	 * @param {object} actions Document-level action controller.
	 * @param {Window|object} environment Event environment.
	 */
	constructor(state, actions, environment = globalThis) {
		this.state = state;
		this.actions = actions;
		this.environment = environment;
		this.onKeyDown = event => {
			this.handle(event);
		};
		environment.addEventListener?.('keydown', this.onKeyDown);
	}

	handle(event) {
		if (isTypingTarget(event.target)) {
			return;
		}
		const command = event.metaKey || event.ctrlKey;
		const key = String(event.key || '').toLowerCase();

		if (command && key === 's') {
			event.preventDefault();
			this.actions.save?.();
			return;
		}
		if (command && key === 'z') {
			event.preventDefault();
			if (event.shiftKey) {
				this.state.redo();
			} else {
				this.state.undo();
			}
			return;
		}
		if (command && key === 'y') {
			event.preventDefault();
			this.state.redo();
			return;
		}
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			this.state.remove();
			return;
		}
		this.nudge(event);
	}

	nudge(event) {
		const direction = NUDGE_KEYS[event.key];
		const object = this.state.find();
		if (!direction || !object) {
			return;
		}
		event.preventDefault();
		const snapshot = this.state.snapshot();
		const multiplier = event.shiftKey ? 4 : 1;
		const distance = snapshot.grid * multiplier;
		this.state.move(object.id, {
			x: object.position.x + direction.x * distance,
			z: object.position.z + direction.z * distance
		});
	}

	destroy() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
	}
}

function isTypingTarget(target) {
	if (!target) {
		return false;
	}
	const tag = String(target.tagName || '').toLowerCase();
	return target.isContentEditable
		|| ['input', 'textarea', 'select'].includes(tag);
}
