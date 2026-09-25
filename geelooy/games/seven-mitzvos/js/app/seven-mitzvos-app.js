//B"H
//Boruch Hashem
//Blessed is He

import { appTemplate } from './app-template.js';
import { required } from './app-elements.js';
import { AppRouteServices } from './app-route-services.js';
import { HashRouter } from './hash-router.js';
import { UNIVERSE_BY_ID, UNIVERSE_GAMES } from '../universe/universe-definitions.js';
import { UniverseProgress } from '../universe/universe-progress.js';

/**
 * @module SevenMitzvosApp
 * @description Owns the lightweight Seven Mitzvos shell and hash lifecycle while
 * city, Realm, and native-3D worlds hydrate only for routes that require them.
 * The Awtsmoos gives the shell immediate finite ownership; Awtsmoos.com reveals
 * each heavier world afterward without making startup wait for every renderer.
 */
export class SevenMitzvosApp {
	constructor(root) {
		this.root = root;
		this.routeGeneration = 0;
		this.escapeHandler = event => this.handleEscape(event);
	}

	mount() {
		this.root.innerHTML = appTemplate();
		this.layers = Object.fromEntries(['hub', 'game', 'realm'].map(name => {
			return [name, required(this.root, `#${name}Layer`)];
		}));
		this.progress = new UniverseProgress(UNIVERSE_GAMES.map(game => game.id));
		this.router = new HashRouter(UNIVERSE_GAMES.map(game => game.id));
		this.services = new AppRouteServices({
			root: this.root,
			layers: this.layers,
			progress: this.progress,
			definitions: UNIVERSE_GAMES,
			router: this.router,
			onProgress: () => this.refreshProgress()
		});
		this.refreshProgress();
		document.addEventListener('keydown', this.escapeHandler);
		this.router.start(route => this.renderRoute(route));
		document.body.dataset.sevenMitzvosReady = 'true';
	}

	/** Give one hash immediate shell ownership before any heavyweight hydration. */
	renderRoute(route) {
		const generation = ++this.routeGeneration;
		const isCurrent = () => generation === this.routeGeneration;
		this.services.cancelDeferredWorld();
		this.services.stopTransient();
		this.showOnly(route.view);
		if (route.view === 'game') {
			return this.services.startGame(UNIVERSE_BY_ID[route.id], isCurrent);
		}
		if (route.view === 'realm') {
			return this.services.startRealm(isCurrent);
		}
		this.refreshProgress();
		this.services.deferWorld(route, isCurrent);
		return null;
	}

	refreshProgress() {
		this.services?.refresh();
		const legacy = this.progress.legacy();
		required(this.root, '#legacyMark').textContent = `Level ${legacy.level} · ${legacy.mastery}/700`;
	}

	showOnly(view) {
		const active = view === 'game' || view === 'realm' ? view : 'hub';
		for (const [name, layer] of Object.entries(this.layers)) {
			layer.hidden = name !== active;
		}
	}

	handleEscape(event) {
		if (event.key !== 'Escape') return;
		const route = this.router.current();
		if (route.view !== 'hub') {
			this.router.go('hub');
		}
	}

	destroy() {
		this.routeGeneration += 1;
		this.services?.destroy();
		this.router?.destroy();
		document.removeEventListener('keydown', this.escapeHandler);
		delete document.body.dataset.sevenMitzvosReady;
		this.root.replaceChildren();
	}
}
