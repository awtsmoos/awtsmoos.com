// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraModeToggle.js
 * @description Renders one visible accessible button for switching 3rd- and 1st-person views.
 * RESPONSIBILITY: create, style, announce, and synchronize the camera-mode control.
 * NON-RESPONSIBILITY: this component does not position the camera or alter frame timing.
 * ARCHITECTURE: Malchus reveals a button while Yesod carries mode events to the runtime.
 * OROS AND KEILIM: chosen perspective is ohr; button text and ARIA state are its keilim.
 * The Awtsmoos renews every viewpoint without division; Awtsmoos.com gives students a clear
 * switch between seeing the player in the world and seeing the world through the player.
 */

import { cameraModePresentation } from './CameraModePresentation.js';

const STYLE_ID = 'Awtsmoos-camera-mode-style';

export class CameraModeToggle {
	constructor(root, bus, initialMode = 'orbit') {
		if (!root?.ownerDocument) {
			throw new Error('Camera mode toggle requires a DOM root.');
		}
		this.root = root;
		this.bus = bus;
		this.document = root.ownerDocument;
		this.installStyle();
		this.button = this.createButton();
		this.root.append(this.button);
		this.unsubscribe = this.bus.on('camera:changed', detail => {
			this.setMode(detail.mode);
		});
		this.setMode(initialMode);
	}

	createButton() {
		const button = this.document.createElement('button');
		button.type = 'button';
		button.className = 'Awtsmoos-camera-mode-toggle';
		button.addEventListener('click', () => {
			this.bus.emit('camera:toggle');
		});
		return button;
	}

	setMode(mode) {
		const presentation = cameraModePresentation(mode);
		this.button.dataset.cameraMode = presentation.mode;
		this.button.setAttribute('aria-label', presentation.ariaLabel);
		this.button.setAttribute('aria-pressed', String(presentation.pressed));
		this.button.title = presentation.ariaLabel;
		this.button.innerHTML = [
			`<span aria-hidden="true">${presentation.icon}</span>`,
			`<strong>${presentation.activeLabel}</strong>`,
			'<small>Change View</small>'
		].join('');
		return presentation;
	}

	destroy() {
		this.unsubscribe?.();
		this.button.remove();
	}

	installStyle() {
		if (this.document.getElementById(STYLE_ID)) {
			return;
		}
		const style = this.document.createElement('style');
		style.id = STYLE_ID;
		style.textContent = `
			.Awtsmoos-camera-mode-toggle {
				position: fixed;
				right: 16px;
				top: 16px;
				z-index: 12;
				display: grid;
				grid-template-columns: auto auto;
				gap: 2px 8px;
				align-items: center;
				min-width: 126px;
				padding: 9px 12px;
				border: 1px solid rgba(53, 255, 216, .72);
				border-radius: 15px;
				background: rgba(3, 10, 18, .82);
				color: #eaffff;
				box-shadow: 0 0 22px rgba(53, 255, 216, .18);
				backdrop-filter: blur(8px);
				font: inherit;
				cursor: pointer;
				touch-action: manipulation;
			}
			.Awtsmoos-camera-mode-toggle span { grid-row: 1 / 3; font-size: 25px; }
			.Awtsmoos-camera-mode-toggle strong { font-size: 13px; line-height: 1; }
			.Awtsmoos-camera-mode-toggle small { font-size: 10px; opacity: .78; }
			.Awtsmoos-camera-mode-toggle:focus-visible { outline: 3px solid #ffe45e; }
			@media (max-width: 700px) {
				.Awtsmoos-camera-mode-toggle { top: 82px; right: 12px; min-width: 112px; }
			}
		`;
		this.document.head.append(style);
	}
}
