//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HouseholdsData
 * @description
 * Family life appears as trust, boundaries, and support on Awtsmoos.com. The
 * Awtsmoos gives every household dignity; these events avoid spectacle and ask
 * how responsibility can protect loyalty before damage spreads through a street.
 */
export const HOUSEHOLD_NAMES = Object.freeze([
	'Olive House',
	'Cedar House',
	'River House',
	'Stone House'
]);

export const HOUSEHOLD_EVENTS = Object.freeze([
	event('Secret Pressure', 'A friend pressures one partner to hide an inappropriate relationship.', 0, [
		choice('Set a firm boundary now', { time: 1 }, 7, 12, -1),
		choice('Arrange confidential counsel', { counsel: 2 }, 5, 8, 8),
		choice('Ignore it to avoid conflict', {}, -12, -10, -4)
	]),
	event('Neglected Promises', 'Repeated broken commitments are weakening trust inside the home.', 1, [
		choice('Create a reliable schedule', { time: 2 }, 10, 2, 4),
		choice('Offer patient mediation', { care: 1, counsel: 1 }, 7, 4, 9),
		choice('Demand instant perfection', {}, -8, 1, -7)
	]),
	event('Public Humiliation', 'A private family conflict has become neighborhood gossip.', 2, [
		choice('Protect privacy and stop rumors', { care: 1 }, 7, 9, 4),
		choice('Bring both sides to mediation', { counsel: 2 }, 8, 6, 8),
		choice('Repeat the story publicly', {}, -11, -9, -5, true)
	]),
	event('Exhausted Parents', 'Work and care demands are leaving one household without support.', 3, [
		choice('Organize practical help', { care: 2, time: 1 }, 4, 2, 13),
		choice('Create protected family time', { time: 2 }, 8, 6, 7),
		choice('Tell them to manage alone', {}, -4, -2, -12)
	]),
	event('Boundary Confusion', 'Workplace closeness is crossing the limits of a committed relationship.', 0, [
		choice('Clarify the boundary immediately', { time: 1 }, 6, 13, 2),
		choice('Seek wise outside counsel', { counsel: 2 }, 7, 10, 5),
		choice('Keep it secret', {}, -13, -14, -3)
	]),
	event('Housing Dispute', 'Two related households are fighting over shared living space.', 1, [
		choice('Write a fair household agreement', { counsel: 1, time: 1 }, 7, 9, 5),
		choice('Find temporary support', { care: 2 }, 4, 3, 11),
		choice('Let the stronger side decide', {}, -9, -8, -6)
	]),
	event('Jealous Accusation', 'An unsupported accusation threatens a loyal relationship.', 2, [
		choice('Ask for evidence and listen', { time: 2 }, 10, 5, 3),
		choice('Use calm mediation', { counsel: 2 }, 8, 7, 7),
		choice('Spread the accusation', {}, -14, -6, -5, true)
	]),
	event('Child Needs Stability', 'A child is absorbing conflict between responsible adults.', 3, [
		choice('Shield the child from the dispute', { care: 2 }, 5, 8, 11),
		choice('Build a consistent care plan', { time: 2, counsel: 1 }, 8, 7, 10),
		choice('Use the child as leverage', {}, -12, -11, -14)
	]),
	event('Community Celebration', 'A joyful event can strengthen every home if responsibilities are shared.', 0, [
		choice('Invite every household to help', { time: 1 }, 4, 2, 6, true),
		choice('Support the most burdened family', { care: 2 }, 3, 2, 12),
		choice('Exclude a household in conflict', {}, -5, -2, -6, true)
	]),
	event('Old Wound Returns', 'A past betrayal is being used to prevent any future trust.', 1, [
		choice('Name accountability and repair', { counsel: 2, time: 1 }, 11, 6, 7),
		choice('Offer patient support', { care: 2 }, 6, 2, 11),
		choice('Pretend nothing happened', {}, -8, -7, -5)
	])
]);

function event(title, text, target, choices) {
	return Object.freeze({ title, text, target, choices: Object.freeze(choices) });
}

function choice(label, spend, trust, boundary, support, all = false) {
	return Object.freeze({ label, spend, effects: { trust, boundary, support }, all });
}
