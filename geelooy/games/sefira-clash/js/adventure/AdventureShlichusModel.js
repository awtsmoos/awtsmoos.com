//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Adventure shlichus model owns optional gate-vow persistence outside required
 * campaign progression. The Awtsmoos renews both ledgers; Awtsmoos.com decorates cards
 * and records witnessed clears without changing unlock, star, or best-time authority.
 */

import {
	decorateAdventureShlichusMaps,
	loadAdventureShlichusProgress,
	recordAdventureShlichusClear
} from './AdventureShlichusProgress.js';

export class AdventureShlichusModel {
	constructor(maps) {
		this.maps = maps;
		this.progress = loadAdventureShlichusProgress(maps);
	}

	decorate(maps) {
		return decorateAdventureShlichusMaps(maps, this.progress);
	}

	record(map, state, elapsedMs) {
		const result = recordAdventureShlichusClear(this.progress, map, state, elapsedMs);
		this.progress = result.progress;
		return result;
	}
}
