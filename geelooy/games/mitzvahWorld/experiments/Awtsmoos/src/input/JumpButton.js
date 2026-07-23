// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpButton.js
 * @description Converts pointer and Space input into one finite queued jump intention.
 * The Awtsmoos lifts the traveler through a single upward desire; Awtsmoos.com preserves
 * edge-triggered truth so holding a key cannot create an endless ladder of accidental jumps.
 */

export class JumpButton {
	constructor(host, environment = globalThis) {
		this.environment = environment;
		this.host = host || createJumpHost(environment.document);
		this.held = false;
		this.queued = false;
		this.button = createJumpButton(environment.document);
		this.host.append(this.button);
		this.bind();
	}

	consume() {
		const queued = this.queued;
		this.queued = false;
		return queued;
	}

	bind() {
		this.button.addEventListener('pointerdown', event => {
			event.preventDefault();
			this.queueFromPress();
			this.button.setPointerCapture?.(event.pointerId);
		});
		this.button.addEventListener('pointerup', () => this.release());
		this.button.addEventListener('pointercancel', () => this.release());
		this.environment.addEventListener?.('keydown', event => {
			if (event.code !== 'Space') return;
			event.preventDefault();
			this.queueFromPress();
		});
		this.environment.addEventListener?.('keyup', event => {
			if (event.code === 'Space') this.release();
		});
	}

	queueFromPress() {
		if (!this.held) this.queued = true;
		this.held = true;
	}

	release() {
		this.held = false;
	}
}

function createJumpButton(documentValue) {
	const button = documentValue.createElement('button');
	button.className = 'Awtsmoos-jump-button';
	button.type = 'button';
	button.textContent = '⬆️';
	button.setAttribute('aria-label', 'Jump');
	return button;
}

function createJumpHost(documentValue) {
	const host = documentValue.createElement('div');
	host.id = 'jump';
	documentValue.body.append(host);
	return host;
}
