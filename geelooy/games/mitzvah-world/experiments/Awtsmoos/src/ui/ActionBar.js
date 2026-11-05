// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBar.js
 * @description Presents bag, quest, Torah, profile, market, map, run, and return slots.
 * The Awtsmoos renews many powers beneath one small row; Awtsmoos.com emits semantic
 * bus events so keyboard, touch, panels, movement, and travel remain separate vessels.
 */

const ACTIONS = Object.freeze([
	action('bag', '🎒', 'Bag', 'inventory:toggle', 'i'),
	action('quests', '📜', 'Shlichus', 'questlog:toggle', 'q'),
	action('torah', '📚', 'Sefarim', 'torah:toggle', 'b'),
	action('profile', '🌟', 'Profile', 'profile:toggle', 'p'),
	action('vendor', '🏪', 'Market', 'vendor:toggle', 'v'),
	action('map', '🗺️', 'Map', 'map:toggle', 'm')
]);

export class ActionBar {
	constructor(host, bus, state) {
		this.host = host || makeHost();
		this.bus = bus;
		this.state = state;
		this.unsubscribers = [];
		this.keyHandler = event => this.onKey(event);
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-action-host');
		this.host.innerHTML = '<nav class="Awtsmoos-action-bar" aria-label="B\'H action slots"></nav>';
		this.bar = this.host.querySelector('.Awtsmoos-action-bar');
		this.unsubscribers.push(this.bus.on('mode:changed', () => this.render()));
		this.unsubscribers.push(this.bus.on('level:changed', () => this.render()));
		addEventListener('keydown', this.keyHandler);
		this.render();
	}

	render() {
		const actions = [
			...ACTIONS,
			action(
				'run',
				this.state.runMode ? '🏃' : '🚶',
				this.state.runMode ? 'Run' : 'Walk',
				'mode:toggle-run',
				'shift'
			)
		];
		if (String(this.state.level).startsWith('lava')) {
			actions.push(action('return', '🏠', 'Back', 'level:return-eretz', 'escape'));
		}
		this.bar.replaceChildren(...actions.map(definition => actionButton(definition)));
		this.bar.querySelectorAll('button').forEach(button => {
			button.addEventListener('pointerdown', event => {
				event.preventDefault();
				event.stopPropagation();
				this.activate(button.dataset.event);
			});
		});
	}

	activate(eventType) {
		this.bus.emit(eventType);
	}

	onKey(event) {
		if (event.repeat || isTextEntry(event.target)) return;
		const key = event.key.toLowerCase();
		const actionValue = ACTIONS.find(item => item.key === key);
		if (actionValue) this.activate(actionValue.eventType);
		if (key === 'shift') this.activate('mode:toggle-run');
		if (key === 'escape' && String(this.state.level).startsWith('lava')) {
			this.activate('level:return-eretz');
		}
	}

	destroy() {
		removeEventListener('keydown', this.keyHandler);
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}

function action(id, icon, label, eventType, key) {
	return Object.freeze({ eventType, icon, id, key, label });
}

function actionButton(definition) {
	const button = document.createElement('button');
	button.dataset.action = definition.id;
	button.dataset.event = definition.eventType;
	button.setAttribute('aria-label', definition.label);
	button.innerHTML = `<span>${definition.icon}</span><small>${definition.label}</small>`;
	return button;
}

function isTextEntry(target) {
	return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}

function makeHost() {
	const host = document.createElement('div');
	document.body.appendChild(host);
	return host;
}
