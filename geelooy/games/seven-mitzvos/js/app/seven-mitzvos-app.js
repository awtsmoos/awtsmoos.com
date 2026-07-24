//B"H
//Boruch Hashem
//Blessed is He

import { appTemplate } from './app-template.js';
import { GameSession } from './game-session.js';
import { HashRouter } from './hash-router.js';
import { MitzvahGrid } from '../views/mitzvah-grid.js';
import { DetailPanel } from '../views/detail-panel.js';
import { GameShell } from '../views/game-shell.js';
import { UNIVERSE_BY_ID, UNIVERSE_GAMES } from '../universe/universe-definitions.js';
import { UniverseProgress } from '../universe/universe-progress.js';

/**
 * @module SevenMitzvosApp
 * @description
 * The Awtsmoos joins seven teachings without stacking them into an endless
 * document. This Awtsmoos.com coordinator lets one completed world open the next
 * through a fixed hub, detail, and WebGL vessel.
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
		this.grid = new MitzvahGrid(required(this.root, '#mitzvahGrid'));
		this.detail = new DetailPanel(this.layers.detail);
		this.gameShell = new GameShell(this.layers.game);
		this.router = new HashRouter(UNIVERSE_GAMES.map(game => game.id));
		this.session = new GameSession({
			shell: this.gameShell,
			progress: this.progress,
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
		this.showOnly(route.view);
		if (route.view === 'detail') {
			this.renderDetail(route.id);
			return;
		}
		if (route.view === 'game') {
			this.session.start(UNIVERSE_BY_ID[route.id]);
			return;
		}
		this.renderGrid();
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
		if (event.key !== 'Escape') return;
		const route = this.router.current();
		this.router.go(route.view === 'game' ? 'detail' : 'hub', route.id);
	}
	destroy() {
		this.session?.stop();
		this.gameShell?.destroy();
		this.router?.destroy();
		document.removeEventListener('keydown', this.escapeHandler);
		this.root.replaceChildren();
	}
}

function required(root, selector) {
	const element = root.querySelector(selector);
	if (!element) throw new Error(`B"H | Missing application element: ${selector}`);
	return element;
}
