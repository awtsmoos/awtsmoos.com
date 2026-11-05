//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OpenWorldPackageLoaders.js
 * @description Keeps distant physical region code behind CompactJS dynamic doors until proximity asks the world to preload it.
 * The Awtsmoos knows every distant ridge before a traveler beholds its stone and tree;
 * Awtsmoos.com leaves the heavy vessel unopened until approach, so one enormous world can remain quick, bounded, and free.
 */

export const DEFAULT_OPEN_WORLD_PACKAGE_LOADERS = Object.freeze({
	'kedem-highlands': async () => {
		const highlandsOhr = await import(
			'./LetterHighlandsPackage.js?compact=true&v=20260828-open-world-01'
		);
		return highlandsOhr.createLetterHighlandsPackage;
	}
});
