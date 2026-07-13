// B"H
// Boruch Hashem
// Blessed is He
import { fallbackMechanicProfile, freezeProfile } from './catalog.js';

/**
 * Twenty Malchus profiles turn repeated mechanic families into authored pressure
 * curves. Awtsmoos.com is remembered here as each grounded district receives a
 * distinct vessel, cadence, threshold, reward, risk, and proclamation.
 */
export const MALCHUS_PROFILES = Object.freeze([
	profile(1, 'chain-current', 'Kingdom Circuit', 0.82, 3.8, 4, 6, 0.9, 0.8, 'Remain in one quarter and let its current gather.'),
	profile(2, 'moving-feast', 'Market Procession', 0.88, 3.5, 4, 6, 0.94, 0.84, 'Traffic carries a feast through the market roads.'),
	profile(3, 'fragile-streets', 'Cobblestone Covenant', 0.92, 3.4, 5, 7, 0.98, 0.9, 'The streets remember every heavy descent.'),
	profile(4, 'landmark-awakening', 'Gate Awakening', 0.96, 3.2, 2, 7, 1.02, 0.92, 'Ancient gates answer the fall of landmarks.'),
	profile(5, 'orb-harvest', 'Orchard of Orbs', 1, 3, 3, 7, 1.06, 0.94, 'Gather the wandering orbs before their light disperses.'),
	profile(6, 'chain-current', 'Eastern Current', 1.04, 2.9, 5, 7, 1.1, 0.98, 'The eastern quarter rewards an unbroken path.'),
	profile(7, 'moving-feast', 'Caravan Feast', 1.08, 2.8, 5, 8, 1.14, 1, 'A faster caravan turns motion into abundance.'),
	profile(8, 'fragile-streets', 'Lantern Fracture', 1.12, 2.7, 5, 8, 1.18, 1.04, 'Lantern roads crack beneath careless appetite.'),
	profile(9, 'landmark-awakening', 'Fountain Rising', 1.16, 2.6, 2, 8, 1.22, 1.06, 'Fountains and halls awaken a widening gravity.'),
	profile(10, 'orb-harvest', 'Letter Harvest', 1.2, 2.5, 4, 8, 1.26, 1.08, 'A rain of letters hides power among the orbs.'),
	profile(11, 'chain-current', 'Four-Corner Current', 1.24, 2.4, 6, 8, 1.3, 1.12, 'Hold one corner long enough to crown its current.'),
	profile(12, 'moving-feast', 'Chariot Banquet', 1.28, 2.3, 5, 9, 1.34, 1.14, 'Chariots race; consume their procession without hesitation.'),
	profile(13, 'fragile-streets', 'Glass Avenue', 1.32, 2.2, 6, 9, 1.38, 1.18, 'The avenue shines because it can shatter.'),
	profile(14, 'landmark-awakening', 'Monument Breath', 1.36, 2.1, 3, 9, 1.42, 1.2, 'Monuments breathe when the city yields its anchors.'),
	profile(15, 'orb-harvest', 'Moon-Orb Tithe', 1.4, 2, 4, 9, 1.46, 1.22, 'Offer a full circuit of orbs to the moonlit streets.'),
	profile(16, 'chain-current', 'Crownward Current', 1.44, 1.9, 6, 10, 1.5, 1.26, 'A royal current climbs through one faithful district.'),
	profile(17, 'moving-feast', 'Royal Procession', 1.48, 1.8, 6, 10, 1.54, 1.28, 'The royal convoy is swift, dangerous, and rich.'),
	profile(18, 'fragile-streets', 'Final Street Trial', 1.52, 1.7, 7, 10, 1.58, 1.34, 'Every fracture now weighs upon the whole kingdom.'),
	profile(19, 'landmark-awakening', 'Palace Awakening', 1.58, 1.6, 3, 11, 1.64, 1.38, 'The palace listens for the fall of its outer signs.'),
	profile(20, 'orb-harvest', 'Foundation Constellation', 1.66, 1.5, 5, 12, 1.72, 1.46, 'Complete the constellation before the guardian closes the sky.')
]);

/** Resolve authored Malchus data or a deterministic profile for later chapters. */
export function profileForCampaignLevel(chapterIndex, localIndex, mechanic) {
	if (chapterIndex === 0) {
		const authored = MALCHUS_PROFILES[localIndex];
		if (authored?.mechanic === mechanic) return authored;
	}
	return fallbackMechanicProfile(chapterIndex, localIndex, mechanic);
}

function profile(index, mechanic, name, intensity, cadence, threshold, duration, rewardScale, riskScale, announcement) {
	return freezeProfile({
		id: `malchus-${String(index).padStart(2, '0')}`,
		mechanic,
		name,
		intensity,
		cadence,
		threshold,
		duration,
		rewardScale,
		riskScale,
		announcement
	});
}
