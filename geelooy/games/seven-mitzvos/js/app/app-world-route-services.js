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
		let world;
		try {
			world = await this.ensureWorld();
		} catch (error) {
			// B"H: hub 3D hydration must never fail silently — surface it loudly.
			console.error('B"H | Seven Mitzvos hub world failed to hydrate.', error);
			this.showWorldError(error);
			return false;
		}
		if (!world || !isCurrent()) {
			return false;
		}
		try {
			world.route(route);
		} catch (error) {
			console.error('B"H | Seven Mitzvos hub world failed to route.', error);
			this.showWorldError(error);
			return false;
		}
		return true;
	}

	/** Renders a visible hub banner when the 3D world cannot hydrate. */
	showWorldError(error) {
		try {
			const root = this.root || document.getElementById('sevenMitzvosApp');
			if (!root || root.querySelector('[data-world-error]')) return;
			const banner = document.createElement('div');
			banner.setAttribute('data-world-error', 'true');
			banner.setAttribute('role', 'alert');
			banner.style.cssText = 'position:relative;z-index:50;margin:12px;padding:12px 16px;border-radius:12px;background:rgba(120,20,20,.92);color:#fff;font:600 14px/1.5 system-ui,sans-serif';
			banner.textContent = `B"H — the 3D city could not hydrate: ${error?.message || error}. The teachings below still work.`;
			root.prepend(banner);
		} catch {
			/* never let the error banner itself throw */
		}
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
