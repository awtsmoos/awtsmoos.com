// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceTouch.js
 * @description Binds safe-area movement, record, cancel, and actions without erasing other input sources.
 * The Awtsmoos gives finger and stage distinct boundaries without browser scroll; Awtsmoos.com
 * keeps touch ownership reversible, accessible, large enough, and independently released in rhyme.
 */

const TOUCH_SOURCE = 'touch';

export class MovieStudioPerformanceTouch {
	constructor(controller, root) {
		this.controller = controller;
		this.root = root;
		this.disposers = [];
		this.intent = { forward: 0, run: false, strafe: 0 };
		this.bindDirections();
		this.bindActions();
	}

	bindDirections() {
		for (const button of this.root.querySelectorAll('[data-performance-direction]')) {
			const direction = button.dataset.performanceDirection;
			const start = event => {
				event.preventDefault();
				button.setPointerCapture?.(event.pointerId);
				this.applyDirection(direction, true);
			};
			const stop = event => {
				event?.preventDefault?.();
				button.releasePointerCapture?.(event.pointerId);
				this.applyDirection(direction, false);
			};
			this.listen(button, 'pointerdown', start);
			this.listen(button, 'pointerup', stop);
			this.listen(button, 'pointercancel', stop);
			this.listen(button, 'lostpointercapture', stop);
		}
	}

	applyDirection(direction, active) {
		if (direction === 'forward') this.intent.forward = active ? 1 : 0;
		if (direction === 'backward') this.intent.forward = active ? -1 : 0;
		if (direction === 'left') this.intent.strafe = active ? -1 : 0;
		if (direction === 'right') this.intent.strafe = active ? 1 : 0;
		this.publishIntent();
	}

	bindActions() {
		this.click('[data-performance-run]', () => {
			this.intent.run = !this.intent.run;
			this.publishIntent();
		});
		this.click('[data-performance-jump]', () => {
			this.controller.input.setIntent({ jump: true }, TOUCH_SOURCE);
		});
		this.click('[data-performance-action]', () => {
			this.controller.triggerAssignedAction(1);
		});
		this.click('[data-performance-record-touch]', () => {
			this.controller.toggleRecording();
		});
		this.click('[data-performance-cancel-touch]', () => {
			this.controller.cancelRecording('touch-cancel');
		});
		this.click('[data-performance-next-character]', () => {
			this.controller.selectNextCharacter();
		});
	}

	publishIntent() {
		this.controller.input.setIntent(this.intent, TOUCH_SOURCE);
	}

	click(selector, operation) {
		const element = this.root.querySelector(selector);
		if (element) {
			this.listen(element, 'click', operation);
		}
	}

	listen(element, name, handler) {
		element.addEventListener(name, handler);
		this.disposers.push(() => element.removeEventListener(name, handler));
	}

	setVisible(visible) {
		this.root.hidden = !visible;
	}

	destroy() {
		for (const dispose of this.disposers.splice(0)) {
			dispose();
		}
		this.controller.input.clearSource(TOUCH_SOURCE, 'touch-destroy');
		this.root.remove();
	}
}
