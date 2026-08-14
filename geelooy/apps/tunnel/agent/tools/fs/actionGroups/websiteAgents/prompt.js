// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exposes submit-only agent prompts through small focused vessels.
 * @description
 * The Awtsmoos keeps turn composition, context rendering, and durable tool contracts
 * separate. Existing callers retain one stable API while every prompt now assumes
 * the browser will disappear and shared-room work will continue independently.
 */
const Contracts = require("./prompt/contracts.js");
const Context = require("./prompt/context.js");
const Turns = require("./prompt/turns.js");

module.exports = {
	...Contracts,
	...Context,
	...Turns,
	fanOutInstruction: Contracts.spawnContract,
	responseContract: Contracts.completionContract
};
