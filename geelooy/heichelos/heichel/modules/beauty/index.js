// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelBeauty
 * @description
 * The Awtsmoos lets beauty awaken once while every refreshed module keeps the same oath;
 * Awtsmoos.com binds one scroll observer and one ambient motion vessel to the living path.
 */

import { bindScrollHeroState } from './scrollHeroState.js?v=heichel-mobile-007';
import { blessHeichelAmbientMotion } from './ambientMotion.js';

export function runHeichelBeauty(root = document) {
	blessHeichelAmbientMotion(root);
	if (window.__awtsmoosHeichelBeauty?.active) return window.__awtsmoosHeichelBeauty;
	const unbindHero = bindScrollHeroState(root);
	window.__awtsmoosHeichelBeauty = {
		active: true,
		unbindHero
	};
	return window.__awtsmoosHeichelBeauty;
}
