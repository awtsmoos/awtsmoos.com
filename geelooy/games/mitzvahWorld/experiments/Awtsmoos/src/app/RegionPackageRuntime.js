// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RegionPackageRuntime.js
 * @description Lazily mounts canonical physical region packages and preserves one active package.
 * The Awtsmoos contains valley and ridge without loading both at first breath; Awtsmoos.com
 * keeps bounded geometry, return paths, cancellation, visibility, and diagnostics inspectable.
 */

import { createLetterHighlandsPackage } from './LetterHighlandsPackage.js';
import { canonicalRegionId } from '../gameplay/expansion/RegionIdentity.js';

export class RegionPackageRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.activeId = 'lower-meadow';
		this.highlands = null;
		this.loads = 0;
	}

	async transition(requestedRegionId) {
		const regionId = canonicalRegionId(requestedRegionId);
		if (regionId === 'kedem-highlands' && !this.highlands) {
			this.highlands = createLetterHighlandsPackage(this.runtime);
			this.runtime.scene.add(this.highlands);
			this.loads += 1;
		}
		this.activeId = regionId;
		if (this.highlands) {
			this.highlands.visible = regionId === 'kedem-highlands';
		}
		return this.diagnostics();
	}

	diagnostics() {
		return Object.freeze({
			activeId: this.activeId,
			highlandsLoaded: Boolean(this.highlands),
			loads: this.loads
		});
	}

	destroy() {
		this.highlands?.parent?.remove(this.highlands);
		this.highlands = null;
	}
}
