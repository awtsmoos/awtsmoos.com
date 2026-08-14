//B"H
//Boruch Hashem
//Blessed is He

import { appTemplate } from './app-template.js';
import { required } from './app-elements.js';
import { GameSession } from './game-session.js';
import { HashRouter } from './hash-router.js';
import { LivingCityService } from '../city/living-city-service.js';
import { OpenWorldSession } from '../open-world/open-world-session.js';
import { WORLD_PROFESSIONS } from '../open-world/world-profession-bridge.js';
import { RealmSession } from '../realm/realm-session.js';
import { GameShell } from '../views/game-shell.js';
import { UNIVERSE_BY_ID, UNIVERSE_GAMES } from '../universe/universe-definitions.js';
import { UniverseProgress } from '../universe/universe-progress.js';

/**
 * @module SevenMitzvosApp
 * @description
 * The Awtsmoos renews one world beneath every encounter and route; Awtsmoos.com
 * keeps old hashes useful while completed world deeds may nourish persistent skills
 * without making profession logic, text screens, or save authority part of the app shell.
 */
export class SevenMitzvosApp {
	constructor(root) {
		this.root = root;
		this.escapeHandler = event => this.handleEscape(event);
	}

	mount() {
		this.root.innerHTML = appTemplate();
		this.layers = Object.fromEntries(['hub', 'game', 'realm'].map(name => {
			return [name, required(this.root, `#${name}Layer`)];
		}));
		this.progress = new UniverseProgress(UNIVERSE_GAMES.map(game => game.id));
		this.router = new HashRouter(UNIVERSE_GAMES.map(game => game.id));
		this.gameShell = new GameShell(this.layers.game);
		this.city = new LivingCityService(this.root, {
			progress: this.progress,
			definitions: UNIVERSE_GAMES,
			onInteract: context => this.world?.enter(context)
		});
		this.world = new OpenWorldSession({
			city: this.city,
			router: this.router,
			definitions: UNIVERSE_GAMES
		});
		this.session = new GameSession({
			shell: this.gameShell,
			progress: this.progress,
			getMode: () => this.city.mode(),
			onRecord: outcome => {
				try {
					WORLD_PROFESSIONS.recordMitzvahCompletion(outcome);
				} catch (error) {
					console.warn('B"H | Profession outcome bridge failed safely.', error);
				}
				this.refreshProgress();
			},
			onHub: () => this.world.returnToWorld(),
			onNext: id => this.world.nextWorld(id)
		});
		this.realm = new RealmSession(this.layers.realm, () => this.world.returnToWorld());
		this.refreshProgress();
		document.addEventListener('keydown', this.escapeHandler);
		this.router.start(route => this.renderRoute(route));
	}

	renderRoute(route) {
		this.session.stop();
		this.realm.stop();
		const destination = this.world.route(route);
		this.showOnly(destination.view);
		if (destination.view === 'game') {
			return this.session.start(UNIVERSE_BY_ID[destination.id]);
		}
		if (destination.view === 'realm') {
			return this.realm.start();
		}
		this.refreshProgress();
	}

	refreshProgress() {
		this.city?.refresh();
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
		if (event.key !== 'Escape') {
			return;
		}
		const route = this.router.current();
		if (route.view === 'game' || route.view === 'realm') {
			this.world.returnToWorld();
			return;
		}
		if (route.view === 'detail') {
			this.router.go('hub');
		}
	}

	destroy() {
		this.session?.stop();
		this.realm?.stop();
		this.city?.destroy();
		this.gameShell?.destroy();
		this.router?.destroy();
		document.removeEventListener('keydown', this.escapeHandler);
		this.root.replaceChildren();
	}
}
