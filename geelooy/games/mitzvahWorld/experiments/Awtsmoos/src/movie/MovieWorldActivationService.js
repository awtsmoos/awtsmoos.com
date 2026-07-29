// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldActivationService.js
 * @description Activates string or object worlds through cancellable staged loading, retry, and immutable receipts.
 * The Awtsmoos renews every world beyond success, failure, retry, object, string, and cancellation;
 * Awtsmoos.com gives each transition one bounded process and preserves legacy snapshot declaration.
 */

import { movieSceneWorldRequest } from './MovieSceneWorldIdentity.js';
import { loadMovieWorld } from './MovieWorldLoader.js';

export function createMovieWorldActivationService(options = {}) {
	let active = null;
	let currentWorld = null;
	let lastRequest = null;
	let status = 'idle';
	const service = {
		activate,
		cancel,
		retry,
		snapshot: () => ({ status, world: currentWorld })
	};
	return service;

	async function activate(world, context = {}) {
		const request = movieSceneWorldRequest(world, context);
		if (!request) return service.snapshot();
		if (request.identity === currentWorld && status === 'ready') {
			return service.snapshot();
		}
		lastRequest = clone({ context, world: request.value });
		cancel();
		const controller = new AbortController();
		active = controller;
		status = 'loading';
		const view = options.createView?.(`Loading ${request.spec?.label || request.identity}`) || null;
		bindView(view);
		try {
			const result = await loadMovieWorld({
				fallback: options.fallback,
				onProgress: state => updateView(view, request, state),
				retries: options.retries,
				signal: controller.signal,
				stages: resolveStages(request, context)
			});
			currentWorld = request.identity;
			status = 'ready';
			updateView(view, request, result);
			view?.remove?.();
			options.onActivated?.({ result, world: request.value });
			return service.snapshot();
		} catch (error) {
			status = controller.signal.aborted ? 'cancelled' : 'error';
			updateView(view, request, {
				details: String(error?.message || error),
				progress: 0,
				status
			});
			if (status === 'cancelled') view?.remove?.();
			throw error;
		} finally {
			if (active === controller) active = null;
		}
	}

	function retry() {
		if (!lastRequest) return Promise.resolve(service.snapshot());
		return activate(lastRequest.world, lastRequest.context);
	}

	function cancel() {
		active?.abort();
		active = null;
	}

	function bindView(view) {
		view?.onRetry?.(() => retry().catch(() => {}));
		view?.onCancel?.(() => cancel());
	}

	function resolveStages(request, context) {
		if (typeof options.stages === 'function') {
			return options.stages(request.value, context);
		}
		if (typeof options.load === 'function') {
			return [{
				id: 'world',
				label: `Loading ${request.spec?.label || request.identity}`,
				load: ({ signal }) => options.load(request.value, context, { signal })
			}];
		}
		throw new Error('World activation requires load() or stages().');
	}
}

function updateView(view, request, state) {
	view?.update?.({
		...state,
		details: state.details || `Preparing ${request.spec?.label || request.identity}.`,
		label: state.current || `Loading ${request.spec?.label || request.identity}`
	});
}

function clone(value) {
	return JSON.parse(JSON.stringify(value || {}));
}
