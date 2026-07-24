// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBar.js
 * @description Renders a retractable MMO hotbar with a real charge meter above its actions.
 * The Awtsmoos measures intention before release; Awtsmoos.com displays name, Hebrew letters,
 * percentage, remaining time, rejection, launch, collision, and damage without covering travel.
 */

const ACTIONS = Object.freeze([
	{ id: 'hebrew-fire', key: 'Digit1', label: 'Hebrew Fire', icon: 'אש' },
	{ id: 'letter-light', key: 'Digit2', label: 'Letter Light', icon: 'אור' },
	{ id: 'staff-strike', key: 'Digit3', label: 'Staff Strike', icon: '⚔' },
	{ id: 'target-cycle', key: 'Tab', label: 'Target', icon: '◎' }
]);

export class MinimalMeadowCombatBar {
	constructor(host, bus, environment = globalThis) {
		this.host = host;
		this.bus = bus;
		this.environment = environment;
		this.collapsed = false;
		this.onClick = event => this.handleClick(event);
		this.onKey = event => this.handleKey(event);
		this.build();
	}

	build() {
		this.host.className = 'Awtsmoos-combat-host';
		this.host.innerHTML = `<section class="Awtsmoos-cast-meter" data-visible="false"><header><b data-cast-name>Ready</b><output data-cast-percent>0%</output></header><div><i data-cast-fill></i></div><small data-cast-time></small></section><div class="Awtsmoos-combat-bar" data-collapsed="false"><button data-collapse title="Retract combat bar">⌄</button>${ACTIONS.map(button).join('')}<output data-cast-status>Ready</output></div>`;
		this.meter = this.host.querySelector('.Awtsmoos-cast-meter');
		this.host.addEventListener('click', this.onClick);
		this.environment.addEventListener?.('keydown', this.onKey);
		this.unsubscribers = listeners(this);
	}

	handleClick(event) {
		if (event.target.closest('[data-collapse]')) return this.toggle();
		const action = event.target.closest('[data-combat-action]')?.dataset.combatAction;
		if (action) this.activate(action);
	}

	handleKey(event) {
		if (event.repeat || isTextEntry(event.target)) return;
		const action = ACTIONS.find(item => item.key === event.code);
		if (!action) return;
		event.preventDefault?.();
		this.activate(action.id);
	}

	activate(actionId) {
		if (actionId === 'target-cycle') this.bus.emit('target:cycle', {});
		else this.bus.emit('combat:activate', { actionId });
	}

	showCast(event) {
		const percent = Math.round((event.progress || 0) * 100);
		this.meter.dataset.visible = 'true';
		this.meter.querySelector('[data-cast-name]').textContent = `${event.label} · ${event.letters}`;
		this.meter.querySelector('[data-cast-percent]').textContent = `${percent}%`;
		this.meter.querySelector('[data-cast-fill]').style.width = `${percent}%`;
		this.meter.querySelector('[data-cast-time]').textContent = `${(event.remaining || event.duration || 0).toFixed(1)}s`;
		this.status(`Charging ${event.letters}…`);
	}

	hideCast(text) {
		this.meter.dataset.visible = 'false';
		this.status(text);
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.host.querySelector('.Awtsmoos-combat-bar').dataset.collapsed = String(this.collapsed);
	}

	status(text) {
		this.host.querySelector('[data-cast-status]').textContent = text;
	}

	diagnostics() {
		return { actions: ACTIONS.length, collapsed: this.collapsed, meterVisible: this.meter.dataset.visible === 'true' };
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.host.removeEventListener('click', this.onClick);
		this.environment.removeEventListener?.('keydown', this.onKey);
	}
}

function listeners(bar) {
	return [
		bar.bus.on('combat:cast-start', event => bar.showCast(event)),
		bar.bus.on('combat:cast-progress', event => bar.showCast(event)),
		bar.bus.on('combat:cast-launch', event => bar.hideCast(`Launched ${event.letters}`)),
		bar.bus.on('combat:cast-cancel', event => bar.hideCast(event.reason.replaceAll('_', ' '))),
		bar.bus.on('combat:impact', event => bar.hideCast(`${event.letters} hit · ${event.health} HP`)),
		bar.bus.on('combat:rejected', event => bar.hideCast(event.reason.replaceAll('_', ' ')))
	];
}

function button(action, index) {
	return `<button data-combat-action="${action.id}" title="${action.label}"><b>${action.icon}</b><small>${action.key === 'Tab' ? 'Tab' : index + 1}</small></button>`;
}

function isTextEntry(target) {
	return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}
