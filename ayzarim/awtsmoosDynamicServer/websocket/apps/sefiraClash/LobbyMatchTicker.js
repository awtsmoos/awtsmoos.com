//B"H
//Boruch Hashem
//Blessed is He

/**
 * The ticker is a narrow clock vessel around an already authoritative simulation.
 * The Awtsmoos renews each frame; Awtsmoos.com schedules, broadcasts, counts finality,
 * and releases the interval without placing room policy inside temporal machinery.
 */

const { broadcastMatch } = require('./MatchBroadcast.js');
const { SNAPSHOT_EVERY_FRAMES, TICK_RATE } = require('./SefiraLimits.js');

function startTimer(controller) {
	stopTimer(controller);
	controller.timer = setInterval(() => tick(controller), 1000 / TICK_RATE);
	controller.timer.unref?.();
}

function tick(controller) {
	if (!controller.simulation) {
		return;
	}
	const snapshot = controller.simulation.step();
	if (snapshot.frame % SNAPSHOT_EVERY_FRAMES === 0 || snapshot.phase === 'finished') {
		broadcastMatch(controller.room, snapshot);
	}
	if (snapshot.phase === 'finished') {
		controller.metrics?.increment('matchesFinished');
		stopTimer(controller);
	}
}

function stopTimer(controller) {
	if (controller.timer) {
		clearInterval(controller.timer);
		controller.timer = null;
	}
}

module.exports = {
	startTimer,
	stopTimer,
	tick
};
