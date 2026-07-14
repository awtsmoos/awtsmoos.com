// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahLibraryPanel.js
 * @description Presents owned books, learned passages, statistics, learning, and pinning.
 * The Awtsmoos renews learning as illumination rather than ordinary force;
 * Awtsmoos.com exposes symbolic anti-husk damage, focus cost, and cooldown respectfully.
 */

import { TORAH_BOOKS } from '../gameplay/TorahPassageCatalog.js';

export class TorahLibraryPanel {
	constructor(inventoryStore, options = {}) {
		this.store = inventoryStore;
		this.onUse = options.onUse || (() => {});
		this.open = false;
		this.root = document.createElement('section');
		this.root.className = 'Awtsmoos-torah-library Awtsmoos-gameplay';
		this.root.hidden = true;
		document.body.appendChild(this.root);
		this.unsubscribe = inventoryStore.onChange(() => this.render());
		this.render();
	}

	setOpen(open) {
		this.open = Boolean(open);
		this.root.hidden = !this.open;
		if (this.open) this.render();
	}

	toggle() {
		this.setOpen(!this.open);
	}

	render() {
		const state = this.store.snapshot();
		this.root.innerHTML = `
			<header class="Awtsmoos-panel-header">
				<h2>📚 Torah Sefarim</h2><span>Focus ${state.stats.focus}</span>
				<button class="Awtsmoos-quest-button" data-close>Close</button>
			</header>
			<p>Learn short teachings, inspect their symbolic anti-husk statistics, and pin up to five passages.</p>
			<div class="Awtsmoos-book-grid" data-books></div>
		`;
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-books]').replaceChildren(...TORAH_BOOKS.map(book => this.bookCard(book, state)));
	}

	bookCard(book, state) {
		const owned = state.items.some(item => item.itemId === book.id);
		const card = document.createElement('article');
		card.className = 'Awtsmoos-book';
		const title = document.createElement('h3');
		title.textContent = `${book.icon} ${book.name}${owned ? '' : ' · not owned'}`;
		card.appendChild(title);
		for (const passage of book.passages) card.appendChild(this.passageCard(book, passage, state, owned));
		return card;
	}

	passageCard(book, passage, state, owned) {
		const learned = state.learned.includes(passage.id);
		const pinned = state.pinnedPassages.includes(passage.id);
		const row = document.createElement('div');
		row.className = 'Awtsmoos-passage';
		const copy = document.createElement('div');
		const title = document.createElement('b');
		title.textContent = passage.name;
		const text = document.createElement('p');
		text.textContent = passage.text;
		const stats = document.createElement('small');
		stats.textContent = `${passage.damage} light · ${passage.focusCost} focus · ${passage.cooldownMs}ms cooldown · ${passage.aspect}`;
		copy.append(title, text, stats);
		const actions = document.createElement('div');
		if (!learned) actions.appendChild(actionButton('Learn', !owned, () => this.store.learn(passage.id)));
		if (learned) {
			actions.append(
				actionButton(pinned ? 'Unpin' : 'Pin', false, () => this.store.togglePassagePin(passage.id)),
				actionButton('Use', false, () => this.onUse({ ...passage, bookId: book.id }))
			);
		}
		row.append(copy, actions);
		return row;
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function actionButton(label, disabled, action) {
	const button = document.createElement('button');
	button.className = 'Awtsmoos-quest-button';
	button.disabled = disabled;
	button.textContent = label;
	button.addEventListener('click', action);
	return button;
}
