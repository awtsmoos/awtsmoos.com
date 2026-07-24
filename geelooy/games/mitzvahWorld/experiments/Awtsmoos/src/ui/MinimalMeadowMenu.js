// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenu.js
 * @description Restores small menu, quest, Torah, profile, and meadow-map panels.
 * The Awtsmoos holds many journeys inside one quiet chamber; Awtsmoos.com reuses a single
 * modal vessel so secondary information never buries the living meadow beneath permanent UI.
 */

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
		this.unsubscribers = [];
		this.onClick = event => this.handleClick(event);
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-meadow-menu');
		this.host.dataset.open = 'false';
		this.host.innerHTML = '<section><header><b data-title></b><button type="button" data-close>×</button></header><div data-body></div></section>';
		this.host.addEventListener('click', this.onClick);
		for (const [eventName, mode] of Object.entries(PANEL_EVENTS)) {
			this.unsubscribers.push(this.bus.on(eventName, () => this.toggle(mode)));
		}
	}

	toggle(mode) {
		if (this.mode === mode && this.host.dataset.open === 'true') {
			this.close();
			return;
		}
		this.mode = mode;
		this.host.dataset.open = 'true';
		this.refresh();
	}

	refresh() {
		if (!this.mode || this.host.dataset.open !== 'true') return;
		const content = panelContent(this.mode, this.runtime);
		this.host.querySelector('[data-title]').textContent = content.title;
		this.host.querySelector('[data-body]').innerHTML = content.body;
	}

	handleClick(event) {
		if (event.target === this.host || event.target.closest('[data-close]')) this.close();
		if (event.target.closest('[data-open-bag]')) {
			this.close();
			this.bus.emit('inventory:open', { source: 'menu' });
		}
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
	const state = runtime.state;
	const profiles = {
		map: ['Rolling Meadow', `<p>Drag to orbit · wheel or pinch to zoom · double-click for pointer lock.</p><p>Position: ${state.x.toFixed(1)}, ${state.z.toFixed(1)} · ground ${state.groundY.toFixed(1)}</p>`],
		menu: ['Mitzvah World', '<p>W/↑ forward · S/↓ reverse · A/D or ←/→ turn · Q/E strafe · Shift or R run · Space jump.</p><button type="button" data-open-bag>Open bag</button>'],
		profile: ['Your Chossid', profileMarkup(runtime)],
		quests: ['Shlichus', '<h3>✨ Sparks at the East Gate</h3><p>Explore the rolling meadow and prepare the path for the village beyond.</p>'],
		torah: ['Sefarim', '<h3>📖 Daily learning</h3><p>Modeh Ani · Shema · Tehillim · Tanya. More passages return as the world expands.</p>']
	};
	const [title, body] = profiles[mode] || profiles.menu;
	return { body, title };
}

function profileMarkup(runtime) {
	const profile = runtime.playerStats || {};
	return `<p><strong>${profile.face || '🎩'} ${profile.name || 'Chossid'}</strong></p><p>Level ${profile.level || 1} · EXP ${profile.xp || 0}/${profile.xpMax || 100}</p><p>${runtime.state.runMode ? 'Running' : runtime.state.moving ? 'Walking' : 'Standing'} · ${runtime.state.clip || 'ready'}</p>`;
}
