//B"H
//Boruch Hashem
//Blessed is He

import { scheduleDeferredRoute } from './deferred-route-task.js';
import { createWorldServices } from './route-service-factories.js';

/**
 * @file app-world-route-services.js
 * @description Owns deferred Seven Mitzvos hub/detail hydration without making
 * city or open-world modules part of shell bootstrap.
 * The Awtsmoos reveals the world only at its appointed route; Awtsmoos.com
 * cancels stale hydration before yesterday's hash can overtake today's choice.
 */
export class AppWorldRouteServices {
	constructor(options) {
		Object.assign(this, options);
		this.city = null;
		this.world = null;
		this.worldLoad = null;
		this.cancelDeferred = null;
		this.destroyed = false;
	}

	/** Return authored difficulty without forcing city modules to load. */
	mode() {
		return this.city?.mode?.() || 'relaxed';
	}

	/** Schedule ordinary hub/detail hydration after immediate shell ownership. */
	deferWorld(route, isCurrent) {
		this.cancelDeferredWorld();
		this.cancelDeferred = scheduleDeferredRoute(() => {
			this.cancelDeferred = null;
			if (isCurrent()) {
				this.routeWorld(route, isCurrent);
			}
		});
	}

	/** Cancel pending hub/detail hydration when another hash takes ownership. */
	cancelDeferredWorld() {
		this.cancelDeferred?.();
		this.cancelDeferred = null;
	}

	/** Lazily compose city + open-world services exactly once. */
	async ensureWorld() {
		if (this.world) {
			return this.world;
		}
		if (!this.worldLoad) {
			this.worldLoad = createWorldServices(this)
				.then(({ city, world }) => {
					if (this.destroyed) {
						city.destroy();
						return null;
					}
					this.city = city;
					this.world = world;
					return world;
				})
				.finally(() => {
					this.worldLoad = null;
				});
		}
		return this.worldLoad;
	}

	/** Apply one hub/detail route only while its async generation remains current. */
	async routeWorld(route, isCurrent) {
		const world = await this.ensureWorld();
		if (!world || !isCurrent()) {
			return false;
		}
		world.route(route);
		return true;
	}

	async returnToWorld() {
		const world = await this.ensureWorld();
		world?.returnToWorld();
	}

	async nextWorld(id) {
		const world = await this.ensureWorld();
		world?.nextWorld(id);
	}

	refresh() {
		this.city?.refresh();
	}

	destroy() {
		this.destroyed = true;
		this.cancelDeferredWorld();
		this.city?.destroy();
		this.city = null;
		this.world = null;
	}
}
