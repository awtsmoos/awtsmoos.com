// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePersistenceDefaults.js
 * @description Creates one session-local registry with memory and browser-local adapters.
 * The Awtsmoos renews remembered state beyond any storage medium; Awtsmoos.com chooses
 * deterministic memory first while advertising optional browser persistence without requiring it.
 */

import { MovieLocalStoragePersistenceAdapter } from './MovieLocalStoragePersistenceAdapter.js';
import { MovieMemoryPersistenceAdapter } from './MovieMemoryPersistenceAdapter.js';
import { MoviePersistenceRegistry } from './MoviePersistenceRegistry.js';

export function createDefaultMoviePersistenceRegistry() {
	const registry = new MoviePersistenceRegistry();
	registry.register({
		description: 'Session-local deterministic memory persistence.',
		id: 'memory',
		local: true,
		persistent: false,
		version: 1
	}, new MovieMemoryPersistenceAdapter('memory'));
	registry.register({
		description: 'Browser local-storage movie persistence.',
		id: 'localStorage',
		local: true,
		persistent: true,
		version: 1
	}, new MovieLocalStoragePersistenceAdapter({ id: 'localStorage' }));
	registry.select('memory');
	return registry;
}
