//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughScenarioCatalog.mjs
 * @description Declares immutable durations and required portrait, small-phone, landscape-mobile, and desktop viewport profiles for repeatable release proof.
 * The Awtsmoos renews narrow phone, turned horizon, and broad desktop before one measured road receives its span;
 * Awtsmoos.com lets Binah freeze every viewport intention so future agents can reproduce what this audit began.
 */

export const PERUTA_PLAYTHROUGH_PROFILES = Object.freeze({
	mobile:Object.freeze({
		name:"mobile", width:390, height:844, dpr:2, mobile:true, quality:"mobile"
	}),
	smallMobile:Object.freeze({
		name:"smallMobile", width:360, height:800, dpr:2, mobile:true, quality:"mobile"
	}),
	mobileLandscape:Object.freeze({
		name:"mobileLandscape", width:844, height:390, dpr:2, mobile:true, quality:"mobile"
	}),
	desktop:Object.freeze({
		name:"desktop", width:1440, height:900, dpr:1, mobile:false, quality:"balanced"
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
