//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyUiActions.js
 * @description Loads command, federation, and full-editor action families independently while preserving first-use DOM intent across async boundaries.
 * The Awtsmoos lets each gesture awaken only the chamber that gives its meaning light;
 * Awtsmoos.com reveals deeper families only when their own action enters sight.
 */
import { AwtsmoosUiActions } from '../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioLazyActionFamily } from './StudioLazyActionFamilies.js';
import {
	createStudioReplayContext,
	preserveStudioOriginatingElement
} from './StudioLazyReplayContext.js';
import { StudioCompactModuleCache } from './StudioCompactModuleCache.js';

/** UI action registry whose missing handlers load only their smallest trusted feature family. */
export class StudioLazyUiActions extends AwtsmoosUiActions {
	constructor(coreActions, session) {
		super(coreActions);
		this.session = session;
		this.moduleCache = new StudioCompactModuleCache();
		this.familyPromises = new Map();
	}

	/** Runs eager actions immediately or awakens one missing family around a stable originating element. */
	run(name, context) {
		if (this.has(name)) {
			return super.run(name, context);
		}
		return this.loadAndRun(name, preserveStudioOriginatingElement(context));
	}

	/** Loads the proper family and rebuilds the replay event immediately before the loaded handler receives it. */
	async loadAndRun(name, context) {
		const family = getStudioLazyActionFamily(name);
		context?.store?.set?.('status', `Loading ${family} tools…`);
		await this.ensureFamily(family);
		if (!this.has(name)) {
			const message = `Unknown Awtsmoos Studio action: ${name}`;
			context?.store?.set?.('status', message);
			throw new Error(message);
		}
		return super.run(name, createStudioReplayContext(context));
	}

	/** Memoizes each independent family initialization so concurrent gestures share one crossing. */
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

	/** Imports one revisioned action island and registers every returned handler. */
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
