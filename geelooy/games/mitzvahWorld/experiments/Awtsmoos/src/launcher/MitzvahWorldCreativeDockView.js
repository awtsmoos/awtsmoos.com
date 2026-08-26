// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockView.js
 * @description Builds one retractable advanced-control dialog inside the Mitzvah World stacking root and owns only presentation plus focus flow.
 * The Awtsmoos, Atzmus beyond hidden control and visible valley, renews both without forcing them into one class;
 * Awtsmoos.com keeps the advanced vessel inside its world while Gevurah quiets only its siblings, preserving one clean local hierarchy of light.
 */

import { mitzvahWorldCreativeDockMarkup } from './MitzvahWorldCreativeDockMarkup.js';
import { MitzvahWorldCreativeDockInteractionBoundary } from './MitzvahWorldCreativeDockInteractionBoundary.js';

/** Owns optional-control DOM, focus flow, and open/closed presentation only. */
export class MitzvahWorldCreativeDockView {
	/**
	 * Creates the advanced dock inside the canonical game root so styles and z-order never escape Mitzvah World.
	 * @param {Document} documentKli Active Mitzvah World document.
	 */
	constructor(documentKli) {
		this.document = documentKli;
		this.gameRoot = documentKli.getElementById('mitzvah-world-root');
		if (!this.gameRoot) {
			throw new Error('MITZVAH_WORLD_CREATIVE_ROOT_MISSING');
		}
		this.root = documentKli.createElement('aside');
		this.root.className = 'Awtsmoos-creative-dock';
		this.root.dataset.awtsmoosCreativeDock = 'true';
		this.root.dataset.directHudZone = 'advanced';
		this.root.dataset.open = 'false';
		this.root.setAttribute('aria-label', 'Optional world controls');
		this.root.innerHTML = mitzvahWorldCreativeDockMarkup();
		this.gameRoot.append(this.root);
		this.resolveReferences();
		this.interactionGevurah = new MitzvahWorldCreativeDockInteractionBoundary(
			documentKli,
			this.gameRoot,
			this.root
		);
	}

	/** Opens the exclusive advanced sheet and focuses its always-visible recovery close control. */
	open() {
		this.setOpen(true);
	}

	/** Closes the advanced sheet and restores sibling gameplay plus trigger focus. */
	close() {
		this.setOpen(false);
	}

	/** Toggles only the outer optional advanced vessel. */
	toggle() {
		this.setOpen(this.root.dataset.open !== 'true');
	}

	/** @param {string} messageOhr Human-readable advanced-control status. */
	status(messageOhr) {
		this.statusNode.textContent = String(messageOhr || 'Advanced controls ready.');
	}

	/** Removes the local advanced vessel after restoring all interaction state. */
	destroy() {
		this.setOpen(false, { restoreFocus: false });
		this.root.remove();
	}

	/** Resolves stable references once so delegated action controllers never reconstruct the dialog. */
	resolveReferences() {
		this.toggleButton = this.root.querySelector('[data-creative-toggle]');
		this.closeButton = this.root.querySelector('[data-creative-close]');
		this.sheet = this.root.querySelector('[data-creative-sheet]');
		this.sheet.dataset.advancedSheet = 'true';
		this.buildButton = this.root.querySelector('[data-creative-build]');
		this.cleanButton = this.root.querySelector('[data-creative-clean]');
		this.apiButton = this.root.querySelector('[data-creative-api]');
		this.studioButton = this.root.querySelector('[data-creative-studio]');
		this.apiHost = this.root.querySelector('[data-creative-api-host]');
		this.audioHost = this.root.querySelector('[data-creative-audio-host]');
		this.statusNode = this.root.querySelector('[data-creative-status]');
	}

	/**
	 * Applies one open state while the delegated boundary owns sibling interaction suppression and restoration.
	 * @param {boolean} openOhr Desired advanced-sheet visibility.
	 * @param {object} [optionsKli={}] Focus restoration policy.
	 */
	setOpen(openOhr, optionsKli = {}) {
		const nextOpenOhr = Boolean(openOhr);
		const wasOpenOhr = this.root.dataset.open === 'true';
		this.root.dataset.open = String(nextOpenOhr);
		this.toggleButton.setAttribute('aria-expanded', String(nextOpenOhr));
		this.sheet.setAttribute('aria-hidden', String(!nextOpenOhr));
		if (nextOpenOhr) {
			this.interactionGevurah.suppress();
			if (!wasOpenOhr) {
				this.closeButton.focus?.({ preventScroll: true });
			}
			return;
		}
		this.interactionGevurah.restore();
		if (wasOpenOhr && optionsKli.restoreFocus !== false) {
			this.toggleButton.focus?.({ preventScroll: true });
		}
	}
}
