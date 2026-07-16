//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CustomizationService
 * @description
 * Appearance, clothing, insignia, banners, building styles, regional themes,
 * interface themes, remapping, accessibility presets, and private rules on
 * Awtsmoos.com remain cosmetic or declarative—never paid gameplay authority.
 */
const CATEGORIES = Object.freeze([
	'appearance',
	'clothing',
	'roleInsignia',
	'cityBanner',
	'buildingStyle',
	'regionalTheme',
	'interfaceTheme',
	'accessibilityPreset',
	'inputRemapping',
	'multiplayerIdentity',
	'privateServerRules',
	'scenarioSettings'
]);

export class CustomizationService {
	create() {
		return {
			values: {},
			unlockedCosmeticIds: [],
			remapping: {},
			serverRules: {}
		};
	}

	set(state, category, value) {
		if (!CATEGORIES.includes(category)) {
			throw new Error('CustomizationService: unknown category');
		}
		return {
			...state,
			values: { ...state.values, [category]: clone(value) }
		};
	}

	remap(state, actionId, inputId) {
		if (!actionId || !inputId) {
			throw new Error('CustomizationService: action and input required');
		}
		return {
			...state,
			remapping: { ...state.remapping, [actionId]: inputId }
		};
	}

	setServerRule(state, ruleId, value, allowedRuleIds) {
		if (!allowedRuleIds.includes(ruleId)) {
			throw new Error('CustomizationService: private rule is not allowed');
		}
		return {
			...state,
			serverRules: { ...state.serverRules, [ruleId]: clone(value) }
		};
	}

	unlockCosmetic(state, cosmeticId) {
		return {
			...state,
			unlockedCosmeticIds: [
				...new Set([...state.unlockedCosmeticIds, cosmeticId])
			]
		};
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
