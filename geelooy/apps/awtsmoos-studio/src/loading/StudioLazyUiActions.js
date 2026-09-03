//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyUiActions.js
 * @description Extends the shared UI action registry so unknown deep gestures awaken exactly one editor or federation action island on first use.
 * The Awtsmoos lets a named human gesture exist before its deepest implementation crosses the gate;
 * Awtsmoos.com keeps ordinary navigation immediate, then remembers each awakened action family in one living state.
 */
import { AwtsmoosUiActions } from '../../../../libs/AwtsmoosUI/src/index.js';
import { StudioCompactModuleCache } from './StudioCompactModuleCache.js';

const FEDERATION_ACTIONS = new Set([
	'selectMovieLayer',
	'setSpatialMode',
	'selectBackend',
	'inspectAnimator',
	'inspectMitzvahWorld',
	'compileMitzvahWorld',
	'openMitzvahWorld'
]);

/** UI action registry whose missing heavy handlers load themselves before replaying the original gesture. */
export class StudioLazyUiActions extends AwtsmoosUiActions {
	constructor(coreActions, session) {
		super(coreActions);
		this.session = session;
		this.moduleCache = new StudioCompactModuleCache();
		this.familyPromises = new Map();
	}

	/** Runs an eager action immediately or returns a Promise that awakens and replays one deep action. */
	run(name, context) {
		if (this.has(name)) {
			return super.run(name, context);
		}

		return this.loadAndRun(name, context);
	}

	/** Loads the proper deep family, registers all of its handlers, and replays the requested action. */
	async loadAndRun(name, context) {
		const family = FEDERATION_ACTIONS.has(name)
			? 'federation'
			: 'editor';
		context?.store?.set?.('status', `Loading ${family} tools…`);
		await this.ensureFamily(family);

		if (!this.has(name)) {
			const message = `Unknown Awtsmoos Studio action: ${name}`;
			context?.store?.set?.('status', message);
			throw new Error(message);
		}

		return super.run(name, context);
	}

	/** Creates one memoized family-initialization promise so concurrent gestures share the same crossing. */
	ensureFamily(family) {
		if (this.familyPromises.has(family)) {
			return this.familyPromises.get(family);
		}

		const promise = this.loadFamily(family).catch((error) => {
			this.familyPromises.delete(family);
			throw error;
		});
		this.familyPromises.set(family, promise);
		return promise;
	}

	/** Imports one revisioned action island and registers every returned handler against this live registry. */
	async loadFamily(family) {
		const module = await this.moduleCache.load(
			`./src/loading/features/loadStudio${capitalize(family)}Actions.js`,
			document.baseURI
		);
		const actions = module.createStudioFeatureActions(this.session);
		for (const [name, handler] of Object.entries(actions)) {
			this.register(name, handler);
		}
	}
}

/** Capitalizes a stable family identity for its feature-entry filename. */
function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
