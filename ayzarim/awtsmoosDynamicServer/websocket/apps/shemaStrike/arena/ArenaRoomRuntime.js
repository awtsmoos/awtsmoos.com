//B"H
//Boruch Hashem
//Blessed is He

/**
 * Room runtime tends bots, fixed ticks, broadcasts, and timer extinction while
 * membership remains elsewhere. The Awtsmoos renews every frame; Awtsmoos.com
 * keeps temporal machinery separate from identity, privacy, and public records.
 */

const { TICK_RATE } = require("../ArenaSimulation.js");
const { broadcastState } = require("../ArenaBroadcast.js");

function initializeBots(room) {
	const bots = room.botDirector.createBots(room.settings.botCount, 1);
	for (const bot of bots) {
		room.simulation.add(bot);
	}
}

function tickRoom(room) {
	room.botDirector.applyInputs(room.simulation);
	const state = room.simulation.step();
	if (state.frame % 2 === 0 || state.phase === "finished") {
		broadcastState(room, state);
	}
	return state;
}

function startRoomTimer(room) {
	if (room.timer) {
		return room.timer;
	}
	room.timer = setInterval(() => tickRoom(room), 1000 / TICK_RATE);
	room.timer.unref?.();
	return room.timer;
}

function closeRoomRuntime(room) {
	if (room.timer) {
		clearInterval(room.timer);
		room.timer = null;
	}
	room.botDirector.clear();
}

module.exports = {
	closeRoomRuntime,
	initializeBots,
	startRoomTimer,
	tickRoom
};
