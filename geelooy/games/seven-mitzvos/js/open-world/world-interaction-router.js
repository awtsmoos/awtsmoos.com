//B"H
//Boruch Hashem
//Blessed is He

import { WORLD_SYSTEM_LOADER } from './world-system-loader.js';
import { WORLD_SYSTEMS } from './world-system-registry.js';

/**
 * @file world-interaction-router.js
 * @description
 * The Awtsmoos renews one nearby intention while every mature domain retains its own authority;
 * Awtsmoos.com routes civic law, Chesed ecology, Sefirah attunement, mitzvah encounters, and Realm passage without confusing their contracts.
 * This router owns dispatch and bounded activation evidence only; it never owns canonical state, saves, DOM structure, or render loops.
 */
export class WorldInteractionRouter {
	constructor(options = {}) {
		this.civic = options.civic;
		this.ecology = options.ecology;
		this.onExternal = options.onExternal || (() => {});
		this.onSefirahAttuned = options.onSefirahAttuned || (() => {});
		this.registry = options.registry || WORLD_SYSTEMS;
		this.loader = options.loader || WORLD_SYSTEM_LOADER;
		this.lastActivation = null;
	}

	/** Routes one winning spatial context to its established domain boundary. */
	handle(context, hud) {
		if (!context) {
			return Promise.resolve({ ok: false, type: 'empty-context' });
		}
		if (context.type === 'civic') {
			return Promise.resolve(this.civic?.handle(context, hud));
		}
		if (context.type === 'ecology') {
			return Promise.resolve(this.ecology?.handle(context, hud));
		}
		if (context.type === 'sefirah') {
			return this.attune(context, hud);
		}
		this.onExternal(context);
		return Promise.resolve({ ok: true, type: 'external', id: context.id });
	}

	/** Lazily awakens every registered system associated with one approached Sefirah. */
	async attune(context, hud) {
		const records = this.registry.forRegion(context.sefirahId);
		const results = await Promise.all(records.map(record => this.loader.load(record.id)));
		const loaded = results.filter(result => result.ok).map(result => result.id);
		const failed = results.filter(result => !result.ok).map(result => ({
			id: result.id,
			error: result.error
		}));
		const result = {
			ok: failed.length === 0,
			type: 'sefirah',
			sefirahId: context.sefirahId,
			loaded,
			failed
		};
		this.lastActivation = result;
		if (loaded.length > 0) {
			this.onSefirahAttuned(context.sefirahId);
		}
		this.projectAttunement(context, result, hud);
		return result;
	}

	view() {
		return {
			lastActivation: this.lastActivation,
			loadedSystems: this.loader.view()
				.filter(record => record.loaded)
				.map(record => record.id)
		};
	}

	projectAttunement(context, result, hud) {
		const ready = result.loaded.length;
		const failed = result.failed.length;
		const suffix = failed > 0 ? ` · ${failed} unavailable` : '';
		hud?.context({
			...context,
			text: `${context.title} attuned · ${ready} world systems ready${suffix}`,
			label: 'Attuned',
			disabled: true
		});
	}
}
