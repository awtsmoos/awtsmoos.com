// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiRuntimeAdapters.js
 * @description Exposes serializable adapter discovery and explicit trusted registration or invocation.
 * The Awtsmoos renews world capability beyond implementation; Awtsmoos.com lets agents
 * inspect declared methods while immutable events announce each bounded lifecycle revelation.
 */

import {
	runMovieStudioApiAsyncOperation,
	runMovieStudioApiOperation
} from './MovieStudioApiOperation.js';

export function createMovieStudioRuntimeAdaptersDomain(session) {
	return Object.freeze({
		invoke: (adapterId, method, payload, options = {}) => (
			runMovieStudioApiAsyncOperation(
				session,
				'runtimeAdapters.invoke',
				options,
				async () => invokeMovieRuntimeAdapter(
					session,
					adapterId,
					method,
					payload
				)
			)
		),
		list: () => session.runtimeAdapters.list(),
		registerTrusted: (manifest, adapter, options = {}) => (
			runMovieStudioApiOperation(
				session,
				'runtimeAdapters.registerTrusted',
				options,
				() => registerMovieRuntimeAdapter(session, manifest, adapter)
			)
		),
		state: () => session.runtimeAdapters.state(),
		unregisterTrusted: (adapterId, options = {}) => (
			runMovieStudioApiOperation(
				session,
				'runtimeAdapters.unregisterTrusted',
				options,
				() => unregisterMovieRuntimeAdapter(session, adapterId)
			)
		)
	});
}

async function invokeMovieRuntimeAdapter(session, adapterId, method, payload) {
	const value = await session.runtimeAdapters.invoke(
		adapterId,
		method,
		payload
	);
	session.events.emit('runtimeAdapter:invoked', {
		adapterId: String(adapterId),
		capability: String(method),
		revision: session.revision
	});
	return value;
}

function registerMovieRuntimeAdapter(session, manifest, adapter) {
	const value = session.runtimeAdapters.register(manifest, adapter);
	session.events.emit('runtimeAdapter:registered', { adapter: value });
	return value;
}

function unregisterMovieRuntimeAdapter(session, adapterId) {
	const id = String(adapterId);
	const removed = session.runtimeAdapters.unregister(id);
	session.events.emit('runtimeAdapter:unregistered', {
		adapterId: id,
		removed
	});
	return { adapterId: id, removed };
}
