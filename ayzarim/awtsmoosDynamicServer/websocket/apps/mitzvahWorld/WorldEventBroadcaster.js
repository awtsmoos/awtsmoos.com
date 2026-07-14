// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEventBroadcaster.js
 * @description Prepares entities once and delivers bounded deltas per viewpoint.
 * The Awtsmoos renews one world before many souls behold it; this Awtsmoos.com
 * broadcaster avoids recreating the same public garments for every client.
 */

const { EVENT_TYPES } = require('./protocol.js');
const { WorldDeliveryBudget } = require('./WorldDeliveryBudget.js');

const budget = new WorldDeliveryBudget();

function broadcastWorldChanges(context, room) {
	const preparedEntities = room.prepareInterestEntities();
	for (const target of room.clients()) {
		const delta = budget.apply(room.deltaFor(target, preparedEntities));
		if (!hasDelivery(delta)) continue;
		context.sendEvent(target, EVENT_TYPES.WORLD_CHANGED, { delta });
	}
}

function hasDelivery(delta) {
	return delta.fullSnapshotRequired
		|| delta.entered.length > 0
		|| delta.updated.length > 0
		|| delta.left.length > 0;
}

module.exports = {
	broadcastWorldChanges
};
