// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootPanel.js
 * @description Shows corpse stacks with individual Take, Loot All, Close, and modal input ownership.
 * The Awtsmoos lets each recovered object be seen before it enters the Bag;
 * Awtsmoos.com keeps the world still beneath deliberate touch and leaves untaken items behind.
 */

import {
	minimalMeadowCorpseLootMarkup
} from './MinimalMeadowCorpseLootPresentation.js';
import {
	installMinimalMeadowCorpseLootStyles
} from './MinimalMeadowCorpseLootStyles.js';

export class MinimalMeadowCorpseLootPanel {
	constructor(bus, documentValue) {
		this.bus = bus;
		this.documentValue = documentValue;
		this.actor = null;
		installMinimalMeadowCorpseLootStyles(documentValue);
		this.root = documentValue.createElement('div');
		this.root.className = 'Awtsmoos-corpse-loot-backdrop';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		documentValue.body.append(this.root);
		this.onClick = (event) => this.click(event);
		this.root.addEventListener('click', this.onClick);
		this.unsubscribeOpen = bus.on('enemy:loot-open', (event) => this.open(event));
		this.unsubscribeClose = bus.on('enemy:loot-close', () => this.close());
	}

	open(event = {}) {
		if (!event.actor) return;
		this.actor = event.actor;
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.documentValue.documentElement.dataset.awtsmoosLootModalOpen = 'true';
		this.render();
	}

	close() {
		this.actor = null;
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		delete this.documentValue.documentElement.dataset.awtsmoosLootModalOpen;
	}

	render() {
		if (this.actor) {
			this.root.innerHTML = minimalMeadowCorpseLootMarkup(this.actor);
		}
	}

	click(event) {
		if (event.target === this.root || event.target.closest('[data-loot-close]')) {
			this.close();
			return;
		}
		const takeButton = event.target.closest('[data-loot-item]');
		if (takeButton) {
			this.finishOrRender(this.actor?.takeLootItem(takeButton.dataset.lootItem));
			return;
		}
		if (event.target.closest('[data-loot-all]')) {
			this.finishOrRender(this.actor?.takeAllLoot());
		}
	}

	finishOrRender(receipt) {
		if (receipt?.empty || this.actor?.looted) {
			this.close();
			return;
		}
		this.render();
	}

	destroy() {
		this.unsubscribeOpen();
		this.unsubscribeClose();
		this.root.removeEventListener('click', this.onClick);
		this.close();
		this.root.remove();
	}
}
