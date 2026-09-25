//B"H
//Boruch Hashem
//Blessed is He

import { AppWorldRouteServices } from './app-world-route-services.js';
import {
	createGameServices,
	createRealmService,
	recordProfessionOutcome
} from './route-service-factories.js';

/**
 * @file app-route-services.js
 * @description Owns lazy Seven Mitzvos game and Realm route services while
 * hub/detail hydration remains isolated in the world-side coordinator.
 * The Awtsmoos reveals only the service required by the current route;
 * Awtsmoos.com keeps shell startup free from renderer and world implementations.
 */
export class AppRouteServices extends AppWorldRouteServices {
	constructor(options) {
		super(options);
		this.session = null;
		this.shell = null;
		this.realm = null;
		this.gameLoad = null;
		this.realmLoad = null;
	}

	/** Stop route-local actors before another hash receives ownership. */
	stopTransient() {
		this.session?.stop();
		this.realm?.stop();
	}

	/** Lazily compose GameShell + GameSession exactly once. */
	async ensureGame() {
		if (this.session) return this.session;
		if (!this.gameLoad) {
			this.gameLoad = createGameServices({
				layer: this.layers.game,
				progress: this.progress,
				getMode: () => this.mode(),
				onRecord: outcome => this.recordOutcome(outcome),
				onHub: () => this.returnToWorld(),
				onNext: id => this.nextWorld(id)
			}).then(({ shell, session }) => {
				if (this.destroyed) {
					shell.destroy();
					return null;
				}
				this.shell = shell;
				this.session = session;
				return session;
			}).finally(() => {
				this.gameLoad = null;
			});
		}
		return this.gameLoad;
	}

	async startGame(definition, isCurrent) {
		const session = await this.ensureGame();
		if (!session || !isCurrent()) return false;
		return session.start(definition);
	}

	/** Lazily create Realm only when the realm route is requested. */
	async startRealm(isCurrent) {
		if (!this.realm && !this.realmLoad) {
			this.realmLoad = createRealmService(this.layers.realm, () => this.returnToWorld())
				.then(realm => this.realm = realm)
				.finally(() => this.realmLoad = null);
		}
		const realm = this.realm || await this.realmLoad;
		if (!realm || !isCurrent()) return false;
		return this.realm.start();
	}

	/** Publish world-profession consequences without making them startup dependencies. */
	async recordOutcome(outcome) {
		try {
			await recordProfessionOutcome(outcome);
		} catch (error) {
			console.warn('B"H | Profession outcome bridge failed safely.', error);
		}
		this.onProgress?.();
	}

	destroy() {
		this.stopTransient();
		this.shell?.destroy();
		this.shell = null;
		this.session = null;
		this.realm = null;
		super.destroy();
	}
}
