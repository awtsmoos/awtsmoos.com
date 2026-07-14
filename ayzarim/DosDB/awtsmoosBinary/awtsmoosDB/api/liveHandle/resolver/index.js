// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/resolver/index.js
 * @chapter The Window Consults The Canonical Address Before It Sees
 * @description
 * Refreshes a handle from the constant-time path ledger before ordinary lineage
 * resolution. The Awtsmoos renews every logical path through one current seal,
 * preventing a quiet sibling from observing or writing a retired chamber while
 * preserving the existing root, lineage, and anchor resolution laws.
 */

const AnchorResolution = require('./anchor/index.js');
const LineageResolution = require('./lineage/index.js');
const RootResolution = require('./root/index.js');
const PathResolver = require('./path/index.js');
const HandleRegistry = require('../../../core/registry/handle.js');

module.exports = {
	ensureResolved(state, force = false) {
		if (state.isUpdatingPointer) return;
		const pathChanged = HandleRegistry.refreshPath(state);
		const database = state.db;
		const currentMutation = database.mutationCount || 0;
		if (
			!force
			&& !pathChanged
			&& state.ptr
			&& state.lastMutationCount === currentMutation
			&& state.type !== null
		) {
			return;
		}

		database.lock.runRead(() => {
			const rootState = database.root
				? HandleRegistry.getSoul(database.root)
				: null;
			const isRoot = rootState
				? state === rootState
				: !state.context && !state.ptr;
			if (isRoot) RootResolution.resolve(state, database);
			else LineageResolution.resolve(state, force || pathChanged);
			AnchorResolution.resolve(state);
			state.lastMutationCount = currentMutation;
		});
	},

	getPath(state) {
		return PathResolver.getPath(state);
	}
};
