// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfilePanel.js
 * @description Presents attributes, derived statistics, allocation, and timed powerups.
 * The Awtsmoos renews every faculty beyond measurement; Awtsmoos.com lets the player
 * direct earned points and Perutas while multiplayer may replace every value with truth.
 */

export class ShliachProfilePanel {
	constructor(store, options = {}) {
		this.store = store;
		this.onAllocate = options.onAllocate || ((id, points) => store.allocate(id, points));
		this.onActivate = options.onActivate || (id => store.activate(id));
		this.open = false;
		this.root = document.createElement('section');
		this.root.className = 'Awtsmoos-sheet Awtsmoos-profile-panel Awtsmoos-gameplay';
		this.root.hidden = true;
		document.body.appendChild(this.root);
		this.unsubscribe = store.onChange(state => this.render(state));
		this.render(store.snapshot());
	}

	setOpen(open) {
		this.open = Boolean(open);
		this.root.hidden = !this.open;
		if (this.open) this.render(this.store.snapshot());
	}

	render(state) {
		this.root.innerHTML = `
			<header class="Awtsmoos-sheet-header">
				<div><small>Level ${state.level}</small><h2>🌟 Shliach Profile</h2></div>
				<button data-close aria-label="Close profile">×</button>
			</header>
			<div class="Awtsmoos-profile-summary">
				<span>Power <b>${state.derived.powerRating}</b></span>
				<span>Perutas <b>${state.perutas}</b></span>
				<span>Points <b>${state.unspentPoints}</b></span>
			</div>
			<h3>Attributes</h3><div class="Awtsmoos-stat-grid" data-attributes></div>
			<h3>Derived Strength</h3><div class="Awtsmoos-derived-grid">${derivedHtml(state.derived)}</div>
			<h3>Timed Powerups</h3><div class="Awtsmoos-powerup-grid" data-powerups></div>
			<p class="Awtsmoos-panel-message" data-message></p>
		`;
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-attributes]').replaceChildren(...attributeCards(state));
		this.root.querySelector('[data-powerups]').replaceChildren(...powerupCards(state));
		this.bindActions();
	}

	bindActions() {
		this.root.querySelectorAll('[data-allocate]').forEach(button => {
			button.addEventListener('click', () => this.perform(() => this.onAllocate(button.dataset.allocate, 1)));
		});
		this.root.querySelectorAll('[data-powerup]').forEach(button => {
			button.addEventListener('click', () => this.perform(() => this.onActivate(button.dataset.powerup)));
		});
	}

	async perform(operation) {
		try {
			const result = await operation();
			if (result?.shliach || result?.attributes) this.store.synchronize(result);
			this.render(this.store.snapshot());
		} catch (error) {
			this.root.querySelector('[data-message]').textContent = humanError(error);
		}
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function attributeCards(state) {
	return Object.entries(state.attributesCatalog).map(([id, definition]) => {
		const card = document.createElement('article');
		card.className = 'Awtsmoos-stat-card';
		card.innerHTML = `<span>${definition.icon}</span><div><b>${definition.name}</b><small>${definition.effect}</small></div><strong>${state.attributes[id]}</strong><button data-allocate="${id}" ${state.unspentPoints < 1 || state.attributes[id] >= definition.maximum ? 'disabled' : ''}>+</button>`;
		return card;
	});
}

function powerupCards(state) {
	return Object.entries(state.powerupsCatalog).map(([id, definition]) => {
		const active = state.activePowerups[id];
		const card = document.createElement('article');
		card.className = 'Awtsmoos-powerup-card';
		card.innerHTML = `<span>${definition.icon}</span><div><b>${definition.name}</b><small>${definition.cost} Perutas · ${Math.round(definition.durationMs / 1000)}s</small></div><button data-powerup="${id}" ${active || state.perutas < definition.cost ? 'disabled' : ''}>${active ? 'Active' : 'Activate'}</button>`;
		return card;
	});
}

function derivedHtml(stats) {
	return `<span>⚔️ +${stats.damageBonus}</span><span>🛡️ ${stats.armor}</span><span>📘 ${stats.focusMaximum}</span><span>🧭 ${stats.trackingRange}m</span>`;
}

function humanError(error) {
	return String(error?.message || error).replaceAll('_', ' ').toLowerCase();
}
