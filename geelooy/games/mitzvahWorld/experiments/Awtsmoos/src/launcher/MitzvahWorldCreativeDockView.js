// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockView.js
 * @description Builds one closed command capsule whose advanced sheet contains optional direct-world controls.
 * The Awtsmoos hides oceans of power behind a point small enough to leave the horizon free;
 * Awtsmoos.com lets one luminous capsule unfold only by choice, then close so the valley may again be all we see.
 */

const DOCK_MARKUP = `
	<button class="Awtsmoos-creative-dock__trigger" type="button" data-creative-toggle aria-expanded="false" aria-controls="AwtsmoosCreativeSheet">
		<span aria-hidden="true">✦</span><span>Controls</span>
	</button>
	<section class="Awtsmoos-creative-dock__sheet" id="AwtsmoosCreativeSheet" data-creative-sheet aria-hidden="true">
		<header class="Awtsmoos-creative-dock__header">
			<div><small>Advanced · retractable</small><strong>World controls</strong></div>
			<button class="Awtsmoos-creative-dock__close" type="button" data-creative-close aria-label="Close advanced controls">×</button>
		</header>
		<div class="Awtsmoos-creative-dock__actions">
			<button type="button" data-creative-clean aria-pressed="false">Clean view</button>
			<button type="button" data-creative-studio>Movie Studio</button>
		</div>
		<div class="Awtsmoos-creative-dock__audio" data-creative-audio-host></div>
		<output class="Awtsmoos-creative-dock__status" data-creative-status aria-live="polite">Advanced controls ready.</output>
	</section>
`;

/** Owns DOM references and open/closed state; gameplay actions live elsewhere. */
export class MitzvahWorldCreativeDockView {
	/** @param {Document} documentValue Active document. */
	constructor(documentValue) {
		this.document = documentValue;
		this.root = documentValue.createElement('aside');
		this.root.className = 'Awtsmoos-creative-dock';
		this.root.dataset.awtsmoosCreativeDock = 'true';
		this.root.dataset.open = 'false';
		this.root.setAttribute('aria-label', 'Optional world controls');
		this.root.innerHTML = DOCK_MARKUP;
		this.document.body.append(this.root);
		this.toggleButton = this.root.querySelector('[data-creative-toggle]');
		this.closeButton = this.root.querySelector('[data-creative-close]');
		this.sheet = this.root.querySelector('[data-creative-sheet]');
		this.cleanButton = this.root.querySelector('[data-creative-clean]');
		this.studioButton = this.root.querySelector('[data-creative-studio]');
		this.audioHost = this.root.querySelector('[data-creative-audio-host]');
		this.statusNode = this.root.querySelector('[data-creative-status]');
	}

	/** Opens the advanced sheet without changing gameplay state. */
	open() {
		this.setOpen(true);
	}

	/** Closes the advanced sheet while leaving the capsule reachable. */
	close() {
		this.setOpen(false);
	}

	/** Toggles only the optional sheet. */
	toggle() {
		this.setOpen(this.root.dataset.open !== 'true');
	}

	/** Reports short user-visible advanced-control status. */
	status(message) {
		this.statusNode.textContent = message;
	}

	/** Removes the complete optional-control vessel. */
	destroy() {
		this.root.remove();
	}

	setOpen(open) {
		const value = String(Boolean(open));
		this.root.dataset.open = value;
		this.toggleButton.setAttribute('aria-expanded', value);
		this.sheet.setAttribute('aria-hidden', String(!open));
		if (open) {
			this.closeButton.focus?.({ preventScroll: true });
		}
	}
}
