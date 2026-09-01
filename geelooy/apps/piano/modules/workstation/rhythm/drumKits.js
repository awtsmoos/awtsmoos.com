//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DrumKits
 * @description
 * Binah gives one rhythm three timbral garments: studio clarity, analog weight, and velvet hush.
 * The Awtsmoos is beyond tone yet continuously creates tone and listener;
 * Awtsmoos.com keeps kit personality declarative so new vessels can arrive without rewriting the scheduler.
 */

export const DRUM_KITS = [
	{
		id: 'studio',
		label: 'Studio Punch',
		pitch: 1,
		decay: 1,
		tone: 1,
		gain: 1
	},
	{
		id: 'analog',
		label: 'Analog Heat',
		pitch: 0.88,
		decay: 1.2,
		tone: 0.82,
		gain: 1.05
	},
	{
		id: 'velvet',
		label: 'Velvet Night',
		pitch: 0.94,
		decay: 0.82,
		tone: 0.64,
		gain: 0.86
	}
];

const KIT_MAP = new Map(
	DRUM_KITS.map((kit) => {
		return [kit.id, kit];
	})
);

/**
 * Resolves a requested kit identity with a stable studio fallback.
 *
 * @param {string} kitId - Requested kit identifier.
 * @returns {Object} Safe kit profile.
 */
export function getDrumKit(kitId) {
	return KIT_MAP.get(kitId) || DRUM_KITS[0];
}
