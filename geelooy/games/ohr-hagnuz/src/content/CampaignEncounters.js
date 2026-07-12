/**
 * B"H
 * @module CampaignEncounters
 * @description Authored bosses and mission encounters for the complete campaign.
 */
const encounter = (name, glyph, light, lesson, element, weakTo, level = 1, extra = {}) => ({
	name, glyph, light, lesson, element, weakTo, level, kind: extra.kind || 'Story Musag',
	moves: extra.moves || []
});

export const CampaignEncounters = {
	tutorial_doubt: encounter('Flicker of Doubt', '?', 42, 'A question becomes a door when named clearly.', 'Uncertainty', 'Mishnah', 1),
	hollow_question: encounter('The Hollow Question', '◌', 86, 'A question without listening consumes its own answer.', 'Emptiness', 'Chassidus', 2),
	distraction_page: encounter('Distraction in the Page', '≋', 92, 'Attention returns scattered letters to one line.', 'Noise', 'Mishnah', 3),
	noise_without_song: encounter('Noise Without Song', '♒', 145, 'Sound becomes music when every voice serves the whole.', 'Noise', 'Niggun', 5),
	entitlement: encounter('Entitlement of the Orchard', '♜', 116, 'First fruit remembers that receiving came before owning.', 'Taking', 'Chassidus', 6),
	cold_calculation: encounter('Cold Calculation', '∑', 128, 'Law without care forgets why order exists.', 'Calculation', 'Rambam', 7),
	noise_fragment: encounter('The Broken Melody', '♪', 134, 'A missing note is restored by listening around it.', 'Discord', 'Niggun', 8),
	collector_first_things: encounter('Collector of First Things', '♛', 188, 'The first belongs to its Source before it belongs to the hand.', 'Hoarding', 'Chassidus', 10),
	mimic_light: encounter('Counterfeit Light', '◇', 142, 'Brightness is not holiness when it serves deception.', 'Imitation', 'Kabbalah', 10),
	caravan_ambush: encounter('Ambush of Scarcity', '⚔', 156, 'Protection is strongest when the vulnerable remain visible.', 'Fear', 'Chassidus', 11),
	merchant_exchange_boss: encounter('Merchant of Exchange', 'נ', 225, 'Not every gift may be reduced to a price.', 'Transaction', 'Rambam', 13),
	arrogance: encounter('Arrogance Without a Teacher', '▲', 168, 'Wisdom begins where certainty makes room to hear.', 'Pride', 'Mishnah', 13),
	protect_students: encounter('Forgetting of the Students', '☍', 182, 'Teaching is measured by who is carried along.', 'Forgetting', 'Chassidus', 14),
	one_who_says_does_not_matter: encounter('The One Who Says It Does Not Matter', 'Ø', 260, 'Meaning returns when every small deed is counted.', 'Apathy', 'Niggun', 16),
	shattered_name: encounter('The Shattered Name', '✦', 340, 'Every restored vessel declares the One who gives it being.', 'Separation', 'Kabbalah', 18, { kind: 'Final Boss' })
};
