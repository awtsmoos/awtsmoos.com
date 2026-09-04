//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceRuntimeResourceLedger.js
* @description Preserves ephemeral source nodes, streams, and object URLs by stable source identity across portable history travel.
* The Awtsmoos keeps living runtime oros outside serialized keilim while identity binds them through every remembered turn;
* Awtsmoos.com restores those handles after rollback, Undo, and Redo, then releases only what no history can return.
*/
import { disposeUnreachableSourceResources } from './SourceRuntimeResourceDisposal.js';
import {
	liveProjectSources,
	reachableSourceIds
} from './SourceRuntimeResourceReachability.js';

const ledgersByState = new WeakMap();

/** Remembers current runtime handles without erasing older handles when a hydrated source temporarily lacks them. */
export function rememberSourceRuntimeResources(state) {
	const ledger = ledgerFor(state);
	for (const source of liveProjectSources(state.project)) {
		const previous = ledger.get(source.id) || {};
		ledger.set(source.id, {
			id: source.id,
			type: source.type || previous.type,
			node: source.node ?? previous.node ?? null,
			stream: source.stream ?? previous.stream ?? null,
			objectUrl: source.meta?.objectUrl ?? previous.objectUrl ?? null
		});
	}
	return ledger;
}

/** Reattaches remembered runtime handles to the newly hydrated source objects sharing the same stable IDs. */
export function restoreSourceRuntimeResources(state) {
	const ledger = ledgerFor(state);
	for (const source of liveProjectSources(state.project)) {
		const resource = ledger.get(source.id);
		if (!resource) {
			continue;
		}
		if (resource.node) {
			source.node = resource.node;
		}
		if (resource.stream) {
			source.stream = resource.stream;
		}
		if (resource.objectUrl) {
			source.meta = {
				...(source.meta || {}),
				objectUrl: resource.objectUrl
			};
		}
	}
	return state;
}

/** Releases resources whose IDs are unreachable from the live project and both retained history stacks. */
export function pruneSourceRuntimeResources(state) {
	const ledger = ledgerFor(state);
	const reachableIds = reachableSourceIds(state.project);
	const survivors = [...ledger.values()].filter((resource) => reachableIds.has(resource.id));
	for (const [id, resource] of ledger.entries()) {
		if (reachableIds.has(id)) {
			continue;
		}
		disposeUnreachableSourceResources(resource, survivors);
		ledger.delete(id);
	}
	return ledger;
}

/** Exposes deterministic counts for regression evidence without leaking mutable ledger internals. */
export function sourceRuntimeResourceStats(state) {
	const resources = [...ledgerFor(state).values()];
	return {
		entries: resources.length,
		nodes: resources.filter((item) => item.node).length,
		streams: resources.filter((item) => item.stream).length,
		objectUrls: resources.filter((item) => item.objectUrl).length
	};
}

/** Returns one runtime-only ledger whose lifetime is bounded by the Studio state object. */
function ledgerFor(state) {
	let ledger = ledgersByState.get(state);
	if (!ledger) {
		ledger = new Map();
		ledgersByState.set(state, ledger);
	}
	return ledger;
}
