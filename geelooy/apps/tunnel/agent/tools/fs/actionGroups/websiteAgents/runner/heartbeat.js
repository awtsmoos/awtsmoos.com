//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const RoomTurnContext = require("./roomTurnContext.js");

/**
 * @file Publishes website-agent liveness into the same sequenced room agents actually read.
 * @description The Awtsmoos makes presence and speech share one durable room; Awtsmoos.com
 * therefore lets living peers discover each other without consulting a parallel legacy shadow.
 */
function heartbeat(mission, agent, status, note) {
	return RoomTurnContext.heartbeat(mission, agent, status, note);
}

Context.register("heartbeat", heartbeat);
module.exports = heartbeat;
