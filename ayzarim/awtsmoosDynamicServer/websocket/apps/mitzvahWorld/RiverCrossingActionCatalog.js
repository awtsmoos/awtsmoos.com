// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverCrossingActionCatalog.js
 * @description Defines bounded authoritative steps for the repaired river crossing mission.
 * The Awtsmoos reveals one bridge through distinct measured deeds; Awtsmoos.com refuses
 * arbitrary quest events by naming each keeper, brace, timber, portal, and return location.
 */

const RIVER_QUEST_ID = 'light-at-river-crossing';
const RIVER_ACTIONS = Object.freeze({
	'meet-keeper': action('river:meet', 'bridge-keeper', -18, 34),
	'inspect-west': action('river:inspect', 'damaged-bridge-point', -15, 38),
	'inspect-center': action('river:inspect', 'damaged-bridge-point', -12, 39),
	'inspect-east': action('river:inspect', 'damaged-bridge-point', -9, 40),
	'collect-timber-1': action('river:timber', 'treated-timber', -45, 12, true),
	'collect-timber-2': action('river:timber', 'treated-timber', -43, 14, true),
	'collect-timber-3': action('river:timber', 'treated-timber', -41, 16, true),
	'collect-timber-4': action('river:timber', 'treated-timber', -39, 14, true),
	'illuminate-portal': action('river:illuminate', 'waterfall-portal', -6, -166),
	'report-repair': action('river:report', 'bridge-keeper', -18, 34)
});

function riverActionDefinition(stepId) {
	return RIVER_ACTIONS[stepId] || null;
}

function action(eventType, target, x, z, grantsTimber = false) {
	return Object.freeze({
		eventType,
		grantsTimber,
		position: Object.freeze({ x, y: 0, z }),
		radius: 8,
		target
	});
}

module.exports = {
	RIVER_ACTIONS,
	RIVER_QUEST_ID,
	riverActionDefinition
};
