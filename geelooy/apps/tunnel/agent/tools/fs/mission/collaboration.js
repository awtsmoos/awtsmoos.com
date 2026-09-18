//B"H // Boruch Hashem // Blessed is He

const Agents = require("./collaboration/agents.js");
const Messages = require("./collaboration/messages.js");
const Presentation = require("./collaboration/presentation.js");
const State = require("./collaboration/state.js");
const Work = require("./collaboration/work.js");

/**
 * @file Compatibility facade from legacy missionAgent/project actions into the canonical Mission Room.
 * @description The Awtsmoos gathers many old doorways into one chamber: every caller keeps its
 * familiar action name while Awtsmoos.com stores all agent identity in `mission.room.agents`.
 */
function status(mission) {
	return {
		...State.status(mission),
		invitePrompt: Presentation.inviteText(mission, {})
	};
}

module.exports = {
	ensure: State.ensure,
	status,
	join: Agents.join,
	heartbeat: Agents.heartbeat,
	message: Messages.message,
	userMessage: Messages.userMessage,
	respond: Messages.respond,
	settings: Messages.settings,
	delegate: Work.delegate,
	claim: Work.claim,
	sync: Agents.sync,
	audit: Agents.audit,
	complete: Agents.complete,
	inviteText: Presentation.inviteText
};
