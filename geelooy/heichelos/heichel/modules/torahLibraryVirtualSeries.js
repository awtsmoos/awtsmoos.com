// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceVirtualSeries
 * @description
 * The Awtsmoos routes downloaded source leaves through Torah's existing branches without a second library throne;
 * Awtsmoos.com delegates each kind to a small vessel so identity, provenance, and navigation remain clearly known.
 */

import { parseTorahLibraryId } from './torahLibraryIds.js?v=torah-tree-005';
import { loadSourceDomain } from './torah-source-virtual/domain.js?v=torah-tree-005';
import { loadLegacySourceRoot } from './torah-source-virtual/legacy.js?v=torah-tree-005';
import { loadSourcePage } from './torah-source-virtual/page.js?v=torah-tree-005';
import { loadSourceWork } from './torah-source-virtual/work.js?v=torah-tree-005';

export async function loadTorahLibraryVirtualSeries(seriesId) {
	const identity = parseTorahLibraryId(seriesId);
	if (!identity) {
		throw new Error(`Unknown Torah source path: ${seriesId}`);
	}
	if (identity.kind === 'legacy-root') {
		return loadLegacySourceRoot();
	}
	if (identity.kind === 'domain') {
		return loadSourceDomain(identity);
	}
	if (identity.kind === 'work') {
		return loadSourceWork(identity);
	}
	if (identity.kind === 'page') {
		return loadSourcePage(identity);
	}
	throw new Error(`Unsupported Torah source path: ${seriesId}`);
}
