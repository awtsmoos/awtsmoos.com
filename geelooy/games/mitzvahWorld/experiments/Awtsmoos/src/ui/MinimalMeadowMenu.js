// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenu.js
 * @description Renders compact live panels only when their content actually changes.
 * The Awtsmoos holds many journeys inside one quiet chamber; Awtsmoos.com keeps current controls,
 * Shlichus, Torah, profile, and map readable without repeated innerHTML churn or a forgotten command.
 */

import { minimalMeadowShlichusMenuContent, subscribeMinimalMeadowShlichus } from './MinimalMeadowMenuShlichus.js';
import { installMinimalMeadowUiRepairStyles } from './MinimalMeadowUiRepairStyles.js';

const PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map',
	'menu:toggle': 'menu',
	'profile:toggle': 'profile',
	'questlog:toggle': 'quests',
	'torah:toggle': 'torah'
});

export class MinimalMeadowMenu {
	constructor(host, bus, runtime) {
		this.host = host;
		this.bus = bus;
		this.runtime = runtime;
		this.mode = null;
		this.lastTitle = '';
		this.lastBody = '';
		this.unsubscribers = [];
		this.onClick = event => this.handleClick(event);
		this.build();
	}

	build() {
		installMinimalMeadowUiRepairStyles(this.host.ownerDocument);
		this.host.classList.add('Awtsmoos-meadow-menu');
		this.host.dataset.open = 'false';
		this.host.innerHTML = '<section><header><b data-title></b><button type="button" data-close>×</button></header><div data-body></div></section>';
		this.host.addEventListener('click', this.onClick);
		for (const [eventName, mode] of Object.entries(PANEL_EVENTS)) {
			this.unsubscribers.push(this.bus.on(eventName, () => this.toggle(mode)));
		}
		this.unsubscribers.push(
			subscribeMinimalMeadowShlichus(this.runtime, () => this.refresh())
		);
	}

	toggle(mode) {
		if (this.mode === mode && this.host.dataset.open === 'true') return this.close();
		this.mode = mode;
		this.host.dataset.open = 'true';
		this.refresh(true);
	}

	refresh(force = false) {
		if (!this.mode || this.host.dataset.open !== 'true') return false;
		const content = panelContent(this.mode, this.runtime);
		if (force || content.title !== this.lastTitle) {
			this.host.querySelector('[data-title]').textContent = content.title;
			this.lastTitle = content.title;
		}
		if (force || content.body !== this.lastBody) {
			this.host.querySelector('[data-body]').innerHTML = content.body;
			this.lastBody = content.body;
		}
		return true;
	}

	handleClick(event) {
		if (event.target === this.host || event.target.closest('[data-close]')) this.close();
		if (!event.target.closest('[data-open-bag]')) return;
		this.close();
		this.bus.emit('inventory:open', { source: 'menu' });
	}

	close() {
		this.host.dataset.open = 'false';
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.host.removeEventListener('click', this.onClick);
	}
}

function panelContent(mode, runtime) {
	if (mode === 'quests') return minimalMeadowShlichusMenuContent(runtime);
	const state = runtime.state;
	const profiles = {
		map: ['Rolling Meadow', `<p>Left-drag orbits camera · right-drag steers view · A/D turn traveler and camera · Q/E strafe.</p><p>Position: ${state.x.toFixed(1)}, ${state.z.toFixed(1)} · ground ${state.groundY.toFixed(1)}</p>`],
		menu: ['Mitzvah World', '<p>W/S forward/back · A/D smooth turn · Q/E strafe · arrows mirror travel/turn · right mouse looks · Shift runs · Space jumps.</p><button type="button" data-open-bag>Open bag</button>'],
		profile: ['Your Chossid', profileMarkup(runtime)],
		torah: ['Sefarim', '<h3>📖 Daily learning</h3><p>Modeh Ani · Shema · Tehillim · Tanya.</p>']
	};
	const [title, body] = profiles[mode] || profiles.menu;
	return { body, title };
}

function profileMarkup(runtime) {
	const profile = runtime.playerStats || {};
	return `<p><strong>${profile.face || '🎩'} ${profile.name || 'Chossid'}</strong></p><p>Level ${profile.level || 1} · EXP ${profile.xp || 0}/${profile.xpMax || 100}</p><p>${runtime.state.runMode ? 'Running' : runtime.state.moving ? 'Walking' : 'Standing'} · ${runtime.state.clip || 'ready'}</p>`;
}
