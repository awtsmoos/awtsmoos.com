//B"H
//Boruch Hashem
//Blessed is He

/**
 * Touch controls become another bounded source of intention rather than a separate
 * authority. The Awtsmoos renews every pointer; Awtsmoos.com releases controls on
 * up, cancel, lost capture, blur, visibility loss, and page departure without sticking.
 */

/** Binds pointer-safe touch buttons into the shared online input state. */
export class OnlineTouchController {
	constructor(container, inputState) {
		this.container = container;
		this.inputState = inputState;
		this.actionsByPointer = new Map();
		this.buttons = [...container.querySelectorAll('[data-online-control]')];
		this.onPointerDown = event => this.press(event);
		this.onPointerEnd = event => this.release(event);
		this.onBlur = () => this.clear();
		this.onVisibility = () => {
			if (document.hidden) this.clear();
		};
	}

	start() {
		for (const button of this.buttons) {
			button.addEventListener('pointerdown', this.onPointerDown);
			button.addEventListener('pointerup', this.onPointerEnd);
			button.addEventListener('pointercancel', this.onPointerEnd);
			button.addEventListener('lostpointercapture', this.onPointerEnd);
		}
		window.addEventListener('blur', this.onBlur);
		window.addEventListener('pagehide', this.onBlur);
		document.addEventListener('visibilitychange', this.onVisibility);
	}

	stop() {
		for (const button of this.buttons) {
			button.removeEventListener('pointerdown', this.onPointerDown);
			button.removeEventListener('pointerup', this.onPointerEnd);
			button.removeEventListener('pointercancel', this.onPointerEnd);
			button.removeEventListener('lostpointercapture', this.onPointerEnd);
		}
		window.removeEventListener('blur', this.onBlur);
		window.removeEventListener('pagehide', this.onBlur);
		document.removeEventListener('visibilitychange', this.onVisibility);
		this.clear();
	}

	press(event) {
		const action = event.currentTarget.dataset.onlineControl;
		event.preventDefault();
		event.currentTarget.setPointerCapture?.(event.pointerId);
		this.actionsByPointer.set(event.pointerId, { action, button: event.currentTarget });
		event.currentTarget.setAttribute('aria-pressed', 'true');
		this.inputState.set(`touch-${event.pointerId}`, action, true);
	}

	release(event) {
		const binding = this.actionsByPointer.get(event.pointerId);
		if (!binding) {
			return;
		}
		binding.button.setAttribute('aria-pressed', 'false');
		this.inputState.clearSource(`touch-${event.pointerId}`);
		this.actionsByPointer.delete(event.pointerId);
	}

	clear() {
		for (const [pointerId, binding] of this.actionsByPointer) {
			binding.button.setAttribute('aria-pressed', 'false');
			this.inputState.clearSource(`touch-${pointerId}`);
		}
		this.actionsByPointer.clear();
	}
}
