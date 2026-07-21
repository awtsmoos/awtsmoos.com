// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahLibraryPanel.js
 * @description Presents learning and canonical drag sources while suspending hidden DOM work.
 */

import { torahAbilityForPassage } from '../gameplay/combat/TorahAbilityCatalog.js';
import { TORAH_BOOKS } from '../gameplay/TorahPassageCatalog.js';

export class TorahLibraryPanel {
	constructor(inventoryStore, options = {}) {
		this.store = inventoryStore;
		this.getFocus = options.getFocus || (() => null);
		this.onAssign = options.onAssign || (() => {});
		this.onUse = options.onUse || (() => {});
		this.open = false;
		this.dirty = false;
		this.domUpdates = 0;
		this.root = document.createElement('section');
		this.root.className = 'Awtsmoos-torah-library Awtsmoos-gameplay';
		this.root.hidden = true;
		document.body.appendChild(this.root);
		this.unsubscribe = inventoryStore.onChange(() => this.changed());
		this.render(true);
	}

	changed() {
		if (this.open) this.render();
		else this.dirty = true;
	}

	setOpen(open) {
		this.open = Boolean(open);
		this.root.hidden = !this.open;
		if (this.open && this.dirty) this.render();
	}

	toggle() {
		this.setOpen(!this.open);
	}

	render(force = false) {
		if (!this.open && !force) {
			this.dirty = true;
			return false;
		}
		const state = this.store.snapshot();
		const focus = this.getFocus() || { current: state.stats.focus, maximum: state.stats.focus };
		this.root.innerHTML = `
			<header class="Awtsmoos-panel-header">
				<h2>📚 Torah Sefarim</h2><span>Focus ${Math.floor(focus.current)} / ${Math.floor(focus.maximum)}</span>
				<button class="Awtsmoos-quest-button" data-close>Close</button>
			</header>
			<p>Learn a passage, use it directly, or place it on the Torah action bar.</p>
			<div class="Awtsmoos-book-grid" data-books></div>
		`;
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-books]').replaceChildren(...TORAH_BOOKS.map(book => this.bookCard(book, state)));
		this.dirty = false;
		this.domUpdates += 1;
		return true;
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
		copy.append(
			text('b', passage.name),
			text('p', passage.text),
			text('small', `${passage.damage} light · ${passage.focusCost} focus · ${passage.cooldownMs}ms · ${passage.aspect}`)
		);
		const actions = document.createElement('div');
		if (!learned) actions.appendChild(actionButton('Learn', !owned, () => this.store.learn(passage.id)));
		if (learned) this.addLearnedActions(actions, book, passage, pinned);
		row.append(copy, actions);
		return row;
	}

	addLearnedActions(actions, book, passage, pinned) {
		const ability = torahAbilityForPassage(passage.id);
		actions.append(
			actionButton(pinned ? 'Unpin' : 'Pin', false, () => this.store.togglePassagePin(passage.id)),
			actionButton('Use', false, () => this.onUse({ ...passage, bookId: book.id }))
		);
		if (!ability) return;
		const assign = actionButton('Add to bar', false, () => this.onAssign(ability.id));
		assign.dataset.torahAbilityId = ability.id;
		assign.draggable = true;
		actions.appendChild(assign);
	}

	snapshot() {
		return { dirty: this.dirty, domUpdates: this.domUpdates, open: this.open };
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

function text(tagName, value) {
	const element = document.createElement(tagName);
	element.textContent = value;
	return element;
}
