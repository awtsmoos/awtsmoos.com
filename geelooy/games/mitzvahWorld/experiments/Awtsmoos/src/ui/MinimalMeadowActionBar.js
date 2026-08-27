// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowActionBar.js
 * @description Restores compact gameplay actions without stealing movement keys.
 * The Awtsmoos gives every command its separate vessel; Awtsmoos.com leaves W, A, S,
 * D, Q, E, arrows, Shift, and Space entirely devoted to travel through the meadow.
 */

const ACTIONS = Object.freeze([
	{ event: 'inventory:toggle', icon: '🎒', key: 'KeyI', label: 'Bag' },
	{ event: 'mode:toggle', icon: '🚶', key: 'KeyR', label: 'Walk', mode: true },
	{ event: 'questlog:toggle', icon: '📜', key: 'KeyJ', label: 'Shlichus' },
	{ event: 'torah:toggle', icon: '📚', key: 'KeyB', label: 'Sefarim' },
	{ event: 'profile:toggle', icon: '🌟', key: 'KeyP', label: 'Chossid' },
	{ event: 'map:toggle', icon: '🗺️', key: 'KeyM', label: 'Map' },
	{ event: 'menu:toggle', icon: '☰', key: 'Escape', label: 'Menu' }
]);

export class MinimalMeadowActionBar {
	constructor(host, bus, environment = globalThis) {
		this.host = host;
		this.bus = bus;
		this.environment = environment;
		this.runMode = false;
		this.onClick = event => this.handleClick(event);
		this.onKeyDown = event => this.handleKeyDown(event);
		this.unsubscribe = bus.on('mode:changed', detail => this.setRunMode(detail.runMode));
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-action-host');
		this.host.innerHTML = `<nav class="Awtsmoos-action-bar" aria-label="Gameplay actions">${ACTIONS.map(buttonMarkup).join('')}</nav>`;
		this.host.addEventListener('click', this.onClick);
		this.environment.addEventListener?.('keydown', this.onKeyDown);
	}

	handleClick(event) {
		const button = event.target.closest('[data-action-event]');
		if (!button) return;
		this.bus.emit(button.dataset.actionEvent, { source: 'action-bar' });
	}

	handleKeyDown(event) {
		if (event.repeat || isTextEntry(event.target)) return;
		const action = ACTIONS.find(item => item.key === event.code);
		if (!action) return;
		event.preventDefault?.();
		this.bus.emit(action.event, { source: 'keyboard' });
	}

	setRunMode(runMode) {
		this.runMode = Boolean(runMode);
		const button = this.host.querySelector('[data-mode-action="true"]');
		if (!button) return;
		button.dataset.active = String(this.runMode);
		button.querySelector('span').textContent = this.runMode ? '🏃' : '🚶';
		button.querySelector('small').textContent = this.runMode ? 'Run' : 'Walk';
	}

	diagnostics() {
		return { actionCount: ACTIONS.length, runMode: this.runMode };
	}

	destroy() {
		this.unsubscribe?.();
		this.host.removeEventListener('click', this.onClick);
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
	}
}

function buttonMarkup(action) {
	return `<button type="button" data-action-event="${action.event}" data-mode-action="${Boolean(action.mode)}" title="${action.label} (${keyLabel(action.key)})"><span>${action.icon}</span><small>${action.label}</small></button>`;
}

function keyLabel(code) {
	return code === 'Escape' ? 'Esc' : code.replace('Key', '');
}

function isTextEntry(target) {
	return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}
