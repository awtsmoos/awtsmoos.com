// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootPanel.js
 * @description Coordinates corpse-loot lifecycle while specialized modules own routing, markup, styles, and focus mechanics.
 * The Awtsmoos lets recovered vessels enter one deliberate chamber before the Bag receives their light;
 * Awtsmoos.com keeps the coordinator thin while each deeper mechanism reveals its own rightful sight.
 */

import { YesodCorpseLootInteraction } from './MinimalMeadowCorpseLootInteraction.js';
import { minimalMeadowCorpseLootMarkup } from './MinimalMeadowCorpseLootPresentation.js';
import { installMinimalMeadowCorpseLootStyles } from './MinimalMeadowCorpseLootStyles.js';
import {
	captureYesodModalEnvironment,
	restoreYesodModalEnvironment
} from './YesodModalEnvironment.js';
import { YesodModalInteractionGuard } from './YesodModalInteractionGuard.js';

export class MinimalMeadowCorpseLootPanel {
	/**
	 * @param {object} yesodBus Event bus.
	 * @param {Document} malchusDocument Owning browser document.
	 */
	constructor(yesodBus, malchusDocument) {
		this.bus = yesodBus;
		this.document = malchusDocument;
		this.actor = null;
		this.environmentRecords = [];
		this.focusedBeforeOpen = null;
		installMinimalMeadowCorpseLootStyles(malchusDocument);

		this.root = malchusDocument.createElement('div');
		this.root.className = 'Awtsmoos-corpse-loot-backdrop';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		malchusDocument.body.append(this.root);

		this.interaction = new YesodCorpseLootInteraction(this);
		this.guard = new YesodModalInteractionGuard(malchusDocument, this.root, {
			firstFocusSelector: '[data-loot-close]',
			onEscape: () => this.close(),
			onOutsideClick: () => this.close()
		});
		this.boundClick = event => this.click(event);
		this.root.addEventListener('click', this.boundClick);
		this.unsubscribeOpen = yesodBus.on('enemy:loot-open', event => this.open(event));
		this.unsubscribeClose = yesodBus.on('enemy:loot-close', () => this.close());
	}

	/** Opens loot for an actor and claims modal input ownership. @param {object} [event={}] Loot event. @returns {boolean} Whether opening succeeded. */
	open(event = {}) {
		if (!event.actor) {
			return false;
		}

		if (!this.actor) {
			this.focusedBeforeOpen = this.document.activeElement;
			this.environmentRecords = captureYesodModalEnvironment(this.document, this.root);
		}

		this.actor = event.actor;
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.render();
		this.guard.activate();
		this.guard.focusFirst();
		return true;
	}

	/** Releases modal ownership and restores surrounding branches. @returns {boolean} Whether an open dialog closed. */
	close() {
		if (!this.actor && this.root.hidden) {
			return false;
		}

		this.guard.deactivate();
		restoreYesodModalEnvironment(this.environmentRecords);
		this.environmentRecords = [];
		this.actor = null;
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		this.focusedBeforeOpen?.focus?.();
		this.focusedBeforeOpen = null;
		return true;
	}

	/** Rebuilds current loot markup and rebinds focus ownership. @returns {boolean} Whether rendering occurred. */
	render() {
		if (!this.actor) {
			return false;
		}

		this.root.innerHTML = minimalMeadowCorpseLootMarkup(this.actor);
		this.guard.setPanel(this.root.querySelector('.Awtsmoos-corpse-loot-panel'));
		return true;
	}

	/** Compatibility doorway for historical delegated click callers. @param {Event} event Native click. @returns {boolean} Whether a command handled it. */
	click(event) {
		return this.interaction.handle(event);
	}

	/** Compatibility doorway for historical transaction callers. @param {object} receipt Loot receipt. @returns {boolean} Whether the dialog closed. */
	finishOrRender(receipt) {
		return this.interaction.finishOrRender(receipt);
	}

	/** Releases subscriptions, modal ownership, DOM listeners, and root. @returns {void} */
	destroy() {
		this.unsubscribeOpen();
		this.unsubscribeClose();
		this.root.removeEventListener('click', this.boundClick);
		this.close();
		this.root.remove();
	}
}
