//B"H
//Boruch Hashem
//Blessed is He
import { appTemplate } from './app-template.js';
import { required } from './app-elements.js';
import { GameSession } from './game-session.js';
import { HashRouter } from './hash-router.js';
import { LivingCityService } from '../city/living-city-service.js';
import { DetailPanel } from '../views/detail-panel.js';
import { GameShell } from '../views/game-shell.js';
import { MitzvahGrid } from '../views/mitzvah-grid.js';
import { UNIVERSE_BY_ID, UNIVERSE_GAMES } from '../universe/universe-definitions.js';
import { UniverseProgress } from '../universe/universe-progress.js';
/**
 * @module SevenMitzvosApp
 * @description
 * The Awtsmoos joins seven teachings, one living city, and one disposable WebGL
 * game vessel. Awtsmoos.com releases the city before opening a world and rebuilds
 * it from saved kindness when the player returns to the fixed hub.
 */
export class SevenMitzvosApp {
	constructor(root) {
		this.root = root;
		this.escapeHandler = event => this.handleEscape(event);
	}
	mount() {
		this.root.innerHTML = appTemplate();
		this.layers = {
			hub: required(this.root, '#hubLayer'),
			detail: required(this.root, '#detailLayer'),
			game: required(this.root, '#gameLayer')
		};
		this.progress = new UniverseProgress(UNIVERSE_GAMES.map(game => game.id));
		this.router = new HashRouter(UNIVERSE_GAMES.map(game => game.id));
		this.grid = new MitzvahGrid(required(this.root, '#mitzvahGrid'));
		this.detail = new DetailPanel(this.layers.detail);
		this.gameShell = new GameShell(this.layers.game);
		this.city = new LivingCityService(this.root, {
			progress: this.progress,
			definitions: UNIVERSE_GAMES,
			onSelect: id => this.router.go('detail', id)
		});
		this.session = new GameSession({
			shell: this.gameShell,
			progress: this.progress,
			getMode: () => this.city.mode(),
			onRecord: () => this.refreshProgress(),
			onHub: () => this.router.go('hub'),
			onNext: id => this.nextWorld(id)
		});
		this.refreshProgress();
		document.addEventListener('keydown', this.escapeHandler);
		this.router.start(route => this.renderRoute(route));
	}
	renderRoute(route) {
		this.session.stop();
		this.city.hide();
		this.showOnly(route.view);
		if (route.view === 'detail') {
			return this.renderDetail(route.id);
		}
		if (route.view === 'game') {
			return this.session.start(UNIVERSE_BY_ID[route.id]);
		}
		this.renderGrid();
		this.city.show();
	}
	renderDetail(id) {
		const definition = UNIVERSE_BY_ID[id];
		this.detail.render(
			definition,
			this.progress.game(id),
			() => this.router.go('hub'),
			() => this.router.go('game', id)
		);
	}
	renderGrid() {
		this.grid.render(
			UNIVERSE_GAMES,
			this.progress,
			id => this.router.go('detail', id)
		);
	}
	nextWorld(id) {
		const index = UNIVERSE_GAMES.findIndex(game => game.id === id);
		const next = UNIVERSE_GAMES[(index + 1) % UNIVERSE_GAMES.length];
		this.router.go('game', next.id);
	}
	refreshProgress() {
		this.renderGrid();
		this.city?.refresh();
		const legacy = this.progress.legacy();
		required(this.root, '#legacyMark').textContent = `Level ${legacy.level} · ${legacy.mastery}/700`;
	}
	showOnly(view) {
		const active = view === 'detail' || view === 'game' ? view : 'hub';
		Object.entries(this.layers).forEach(([name, layer]) => {
			layer.hidden = name !== active;
		});
	}
	handleEscape(event) {
		if (event.key !== 'Escape') {
			return;
		}
		const route = this.router.current();
		this.router.go(route.view === 'game' ? 'detail' : 'hub', route.id);
	}
	destroy() {
		this.session?.stop();
		this.city?.destroy();
		this.gameShell?.destroy();
		this.router?.destroy();
		document.removeEventListener('keydown', this.escapeHandler);
		this.root.replaceChildren();
	}
}
