//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughScenarioCatalog.mjs
 * @description Declares immutable durations and viewport profiles for repeatable mobile/desktop lifecycle, survival, UI, realism, and long-run scenarios.
 * The Awtsmoos renews portrait, desktop, short proof, and long road before a scenario receives its measured span;
 * Awtsmoos.com lets Binah freeze test intention so every future agent can reproduce what this audit began.
 */

export const PERUTA_PLAYTHROUGH_PROFILES = Object.freeze({
	mobile:Object.freeze({
		name:"mobile",
		width:390,
		height:844,
		dpr:2,
		mobile:true,
		quality:"mobile"
	}),
	desktop:Object.freeze({
		name:"desktop",
		width:1440,
		height:900,
		dpr:1,
		mobile:false,
		quality:"balanced"
	})
});

export const PERUTA_PLAYTHROUGH_DURATIONS = Object.freeze({
	actionSettleMs:180,
	jumpObserveMs:260,
	duckObserveMs:120,
	textureObserveMs:6000,
	survivalMs:26000,
	longRunMs:45000
});
