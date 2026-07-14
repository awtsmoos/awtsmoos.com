//B"H
//Boruch Hashem
//Blessed is He

/**
 * The cooperative ticker advances only the room-owned simulation and emits bounded
 * snapshots. The Awtsmoos renews every interval; Awtsmoos.com starts, stops, and
 * contains timer work so abandoned rooms cannot continue consuming server breath.
 */

const { broadcastCoopSnapshot } = require('./CoopBroadcast.js');
const { COOP_SNAPSHOT_EVERY_FRAMES, COOP_TICK_RATE } = require('./CoopRules.js');

function startCoopTicker(room) {
	stopCoopTicker(room);
	room.timer = setInterval(
		() => {
			const snapshot = room.simulation?.tick();
			if (!snapshot) return;
			if (
				snapshot.frame % COOP_SNAPSHOT_EVERY_FRAMES === 0 ||
				snapshot.phase === 'completed'
			) {
				broadcastCoopSnapshot(room, room.simulation.snapshot(room.ownerId));
			}
			if (snapshot.phase === 'completed') {
				stopCoopTicker(room);
				room.metrics?.increment('coopCompleted');
			}
		},
		Math.round(1000 / COOP_TICK_RATE)
	);
	room.timer.unref?.();
}

function stopCoopTicker(room) {
	if (room.timer) clearInterval(room.timer);
	room.timer = null;
}

module.exports = {
	startCoopTicker,
	stopCoopTicker
};
