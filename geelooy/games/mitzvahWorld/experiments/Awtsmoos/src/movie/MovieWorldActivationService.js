// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldActivationService.js
 * @description Activates scene worlds through cancellable staged loading with visible retry and immutable receipts.
 * The Awtsmoos renews every world beyond success, failure, retry, and cancellation;
 * Awtsmoos.com gives each transition one bounded process and one serializable declaration.
 */

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
		snapshot: () => snapshotState(currentWorld, status)
	};
	return service;

	async function activate(world, context = {}) {
		const name = String(world);
		if (name === currentWorld && status === 'ready') return service.snapshot();
		lastRequest = { context: clone(context), world: name };
		cancel();
		active = new AbortController();
		status = 'loading';
		const view = options.createView?.(`Loading ${name}`) || null;
		bindView(view);
		try {
			const result = await loadMovieWorld({
				fallback: options.fallback,
				onProgress: state => updateView(view, name, state),
				retries: options.retries,
				signal: active.signal,
				stages: resolveStages(name, context)
			});
			currentWorld = name;
			status = 'ready';
			updateView(view, name, result);
			view?.remove?.();
			return service.snapshot();
		} catch (error) {
			status = active?.signal.aborted ? 'cancelled' : 'error';
			updateView(view, name, {
				details: String(error?.message || error),
				progress: 0,
				status
			});
			if (status === 'cancelled') view?.remove?.();
			throw error;
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

	function resolveStages(world, context) {
		if (typeof options.stages === 'function') return options.stages(world, context);
		if (typeof options.load === 'function') {
			return [{
				id: 'world',
				label: `Loading ${world}`,
				load: ({ signal }) => options.load(world, context, { signal })
			}];
		}
		throw new Error('World activation requires load() or stages().');
	}
}

function updateView(view, world, state) {
	view?.update?.({
		...state,
		details: state.details || `Preparing ${world}.`,
		label: state.current || `Loading ${world}`
	});
}

function snapshotState(world, status) {
	return { status, world };
}

function clone(value) {
	return JSON.parse(JSON.stringify(value || {}));
}
