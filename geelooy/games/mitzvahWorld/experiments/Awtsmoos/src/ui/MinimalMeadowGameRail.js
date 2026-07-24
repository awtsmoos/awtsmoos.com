// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRail.js
 * @description Owns a persistent Walk/Run control and collapsible secondary right-rail menus.
 * The Awtsmoos gives motion and menu their separate vessels; Awtsmoos.com keeps the chosen pace
 * visible, touchable, and keyboard-readable even while lesser panels withdraw from the small screen.
 */

const SECONDARY_ITEMS = Object.freeze([
	{ eventName: 'inventory:toggle', icon: '🎒', label: 'Bag' },
	{ eventName: 'profile:toggle', icon: '🌟', label: 'Chossid' },
	{ eventName: 'map:toggle', icon: '🗺️', label: 'Map' },
	{ eventName: 'questlog:toggle', icon: '📜', label: 'Shlichus' },
	{ eventName: 'torah:toggle', icon: '📚', label: 'Sefarim' },
	{ eventName: 'controls:toggle', icon: '🎮', label: 'Controls' },
	{ eventName: 'hud:toggle', icon: '👁️', label: 'HUD' },
	{ eventName: 'menu:toggle', icon: '☰', label: 'Menu' }
]);

export class MinimalMeadowGameRail {
	constructor(host, bus) {
		this.host = host;
		this.bus = bus;
		this.collapsed = false;
		this.runMode = false;
		this.onClick = event => this.handleClick(event);
		this.build();
		this.unsubscribeMode = bus.on('mode:changed', detail => {
			this.setRunMode(detail.runMode);
		});
		this.setRunMode(false);
	}

	build() {
		this.host.className = 'Awtsmoos-game-rail-host';
		this.host.innerHTML = railMarkup();
		this.rail = this.host.querySelector('.Awtsmoos-game-rail');
		this.modeButton = this.host.querySelector('[data-mode-toggle]');
		this.collapseButton = this.host.querySelector('[data-rail-collapse]');
		this.secondary = this.host.querySelector('[data-rail-secondary]');
		this.host.addEventListener('click', this.onClick);
	}

	handleClick(event) {
		if (event.target.closest('[data-mode-toggle]')) {
			this.bus.emit('mode:toggle', { source: 'right-rail' });
			return;
		}
		if (event.target.closest('[data-rail-collapse]')) {
			this.toggle();
			return;
		}
		const eventName = event.target.closest('[data-game-event]')?.dataset.gameEvent;
		if (eventName) this.bus.emit(eventName, { source: 'right-rail' });
	}

	setRunMode(runMode) {
		this.runMode = Boolean(runMode);
		const presentation = movementModePresentation(this.runMode);
		this.modeButton.dataset.active = String(this.runMode);
		this.modeButton.setAttribute('aria-pressed', String(this.runMode));
		this.modeButton.title = presentation.title;
		this.modeButton.querySelector('[data-mode-icon]').textContent = presentation.icon;
		this.modeButton.querySelector('[data-mode-label]').textContent = presentation.label;
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.rail.dataset.collapsed = String(this.collapsed);
		this.secondary.hidden = this.collapsed;
		this.collapseButton.setAttribute('aria-expanded', String(!this.collapsed));
		this.collapseButton.textContent = this.collapsed ? '‹' : '›';
	}

	diagnostics() {
		return {
			collapsed: this.collapsed,
			items: SECONDARY_ITEMS.length + 1,
			mode: this.runMode ? 'run' : 'walk',
			runMode: this.runMode
		};
	}

	destroy() {
		this.unsubscribeMode?.();
		this.host.removeEventListener('click', this.onClick);
	}
}

export function movementModePresentation(runMode) {
	return runMode
		? { icon: '🏃', label: 'Run', title: 'Movement mode: Run. Activate to walk.' }
		: { icon: '🚶', label: 'Walk', title: 'Movement mode: Walk. Activate to run.' };
}

function railMarkup() {
	const items = SECONDARY_ITEMS.map(itemMarkup).join('');
	return `<nav class="Awtsmoos-game-rail" data-collapsed="false" aria-label="Game menus"><button type="button" data-mode-toggle data-active="false" aria-pressed="false" style="min-width:44px;min-height:44px"><span data-mode-icon></span><small data-mode-label></small></button><button type="button" data-rail-collapse aria-expanded="true" title="Collapse secondary menu actions">›</button><span data-rail-secondary>${items}</span></nav>`;
}

function itemMarkup(item) {
	return `<button type="button" data-game-event="${item.eventName}" title="${item.label}"><span>${item.icon}</span><small>${item.label}</small></button>`;
}
