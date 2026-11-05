// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRailView.js
 * @description Renders semantic movement, collapse, and secondary menu buttons.
 * The Awtsmoos reveals each action through a measured vessel; Awtsmoos.com gives every control
 * a stable label and geometry so its visible center is also its truthful interactive center.
 */

export const SECONDARY_RAIL_ITEMS = Object.freeze([
	{ eventName: 'inventory:toggle', icon: '🎒', label: 'Bag' },
	{ eventName: 'profile:toggle', icon: '🌟', label: 'Chossid' },
	{ eventName: 'map:toggle', icon: '🗺️', label: 'Map' },
	{ eventName: 'questlog:toggle', icon: '📜', label: 'Shlichus' },
	{ eventName: 'torah:toggle', icon: '📚', label: 'Sefarim' },
	{ eventName: 'controls:toggle', icon: '🎮', label: 'Controls' },
	{ eventName: 'hud:toggle', icon: '👁️', label: 'HUD' },
	{ eventName: 'menu:toggle', icon: '☰', label: 'Menu' }
]);

export function railMarkup(collapsed) {
	return `<nav class="Awtsmoos-game-rail" data-collapsed="${collapsed}" aria-label="Game menus">
		<button type="button" data-mode-toggle data-rail-action="mode" data-active="false" aria-label="Movement mode: Walk" aria-pressed="false">
			<span data-mode-icon aria-hidden="true"></span><small data-mode-label></small>
		</button>
		<button type="button" data-rail-collapse data-rail-action="collapse" aria-expanded="${!collapsed}" aria-label="Toggle secondary actions">${collapsed ? '‹' : '›'}</button>
		<span data-rail-secondary ${collapsed ? 'hidden' : ''}>${SECONDARY_RAIL_ITEMS.map(itemMarkup).join('')}</span>
	</nav>`;
}

function itemMarkup(item) {
	return `<button type="button" data-game-event="${item.eventName}" data-rail-action="event" aria-label="${item.label}" title="${item.label}">
		<span aria-hidden="true">${item.icon}</span><small>${item.label}</small>
	</button>`;
}
