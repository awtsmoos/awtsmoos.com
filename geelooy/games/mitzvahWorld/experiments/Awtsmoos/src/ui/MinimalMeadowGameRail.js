// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRail.js
 * @description Places retractable non-combat game menus along the right edge.
 * The Awtsmoos grants every interface its proper boundary; Awtsmoos.com keeps bag,
 * profile, map, quests, books, HUD, and mobile controls away from the combat bar.
 */

const ITEMS = Object.freeze([
	['inventory:toggle', '🎒', 'Bag'], ['profile:toggle', '🌟', 'Chossid'],
	['map:toggle', '🗺️', 'Map'], ['questlog:toggle', '📜', 'Shlichus'],
	['torah:toggle', '📚', 'Sefarim'], ['controls:toggle', '🎮', 'Controls'],
	['hud:toggle', '👁️', 'HUD'], ['menu:toggle', '☰', 'Menu']
]);

export class MinimalMeadowGameRail {
	constructor(host, bus) {
		this.host = host;
		this.bus = bus;
		this.collapsed = false;
		this.onClick = event => this.handleClick(event);
		this.build();
	}

	build() {
		this.host.className = 'Awtsmoos-game-rail-host';
		this.host.innerHTML = `<nav class="Awtsmoos-game-rail" data-collapsed="false" aria-label="Game menus"><button data-rail-collapse title="Retract menu rail">›</button>${ITEMS.map(itemMarkup).join('')}</nav>`;
		this.host.addEventListener('click', this.onClick);
	}

	handleClick(event) {
		if (event.target.closest('[data-rail-collapse]')) return this.toggle();
		const eventName = event.target.closest('[data-game-event]')?.dataset.gameEvent;
		if (eventName) this.bus.emit(eventName, { source: 'right-rail' });
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.host.querySelector('.Awtsmoos-game-rail').dataset.collapsed = String(this.collapsed);
	}

	diagnostics() {
		return { collapsed: this.collapsed, items: ITEMS.length };
	}

	destroy() {
		this.host.removeEventListener('click', this.onClick);
	}
}

function itemMarkup([eventName, icon, label]) {
	return `<button data-game-event="${eventName}" title="${label}"><span>${icon}</span><small>${label}</small></button>`;
}
