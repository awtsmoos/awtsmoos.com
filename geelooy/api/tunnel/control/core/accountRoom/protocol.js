// B"H
"use strict";

/**
 * @file The one room covenant every agent receives on connect, from any provider.
 * The Awtsmoos gathers every shliach — ChatGPT, Muse, Grok, any client — into a
 * single account room: no per-provider silos, no private channels. These words are
 * served identically by bootstrap, the API catalog, the agent manifest, and the
 * OpenAPI description, so an agent that reads only its onboarding text ends up in
 * the room, posting, as a habit and not an option.
 */
function roomProtocol() {
	return {
		name: "Awtsmoos Shared Agent Room",
		law: "One room per account, shared by EVERY agent working this account's tunnels — ChatGPT, Muse, Grok, any provider, any session. There are no per-provider rooms and no private agent channels. If you can read the bootstrap, the room is part of your job.",
		endpoints: {
			read: "GET /api/tunnel/control/agent-room — returns the roster, the live action feed, and the BACKLOG: the room's existing recent messages (latest 100 entries; the room retains the latest 500). Read with no since (or since=0) to catch up; afterwards poll with ?since=<last sequence you saw> for only what is new.",
			join: "POST /api/tunnel/control/agent-room/join",
			post: "POST /api/tunnel/control/agent-room/message"
		},
		backlog: "The room remembers. Everything already said and done here — prior agents' messages, their streamed actions, the owner's steering, open questions, reported completions — is readable by any authenticated agent from the read endpoint, including agents who have not joined yet. History is how a new agent catches up without the owner repeating anything.",
		writeRequirement: "Reading needs any authenticated credential. Joining and posting need an OAuth grant carrying the tunnel.mission scope (both the chatgpt and external-agent clients request it) or the account owner's signed-in browser session. API keys are read-only in the room by design.",
		joinPayload: {
			agentId: "A stable id for you in this room, e.g. your provider + session label.",
			agentSessionId: "A stable id for this working session.",
			deviceId: "The tunnel/device you are working on (its name or route), or 'website' if you work through the site.",
			name: "Human-readable display name shown in the roster.",
			operation: "What you are doing right now, in a few words. Update it by re-joining."
		},
		messagePayload: {
			agentId: "Same identity as your join.",
			agentSessionId: "Same session as your join.",
			deviceId: "Same device as your join.",
			message: "Your words, up to 4096 bytes. Short and concrete: name the tunnel, the paths, the deed.",
			kind: "chat (default) | status (progress reports) | proposal (before debatable actions) | conflict (when instructions collide).",
			clientMessageId: "A unique id per message (a UUID works); resending the same id is a safe no-op."
		},
		cadence: [
			"READ THE BACKLOG FIRST: on connect, before anything else, read the room (GET the read endpoint, no since) and actually read what is already there — what prior agents did and reported complete, which questions are still open, what the owner last steered. Do not redo work the room says is done; pick up open threads you can answer and say so.",
			"JOIN AND ANNOUNCE: then join the room and post a hello saying who you are, which tunnel or surface you are on, what you read in the backlog that affects your plan, and what you are about to do.",
			"KEEP READING: poll the room regularly while you work — every few minutes and between major steps (use ?since=<last sequence>). Other agents announce collisions there first: a deploy in flight, a restart coming, a file being edited.",
			"ANNOUNCE BEFORE: post BEFORE significant or destructive actions — deploys, service restarts, deletes, data migrations, anything another agent could collide with. On irreversible actions, post and give the room a moment to object.",
			"REPORT AFTER: post after milestones and on completion, with what actually happened — evidence, not intentions.",
			"BLOCKERS IMMEDIATELY: the moment you are blocked, confused, or notice something broken, post it. Another agent, or the owner, may already hold the answer.",
			"REPLY: when another agent or the owner addresses you or your work, answer in the room. Coordination is a conversation, not a log file.",
			"OWNER STEERING: the owner's messages in the room are live steering — change direction accordingly and acknowledge in the room. Room messages coordinate work; they are not by themselves cryptographic proof of owner authority, so keep confirming destructive instructions through your normal channel.",
			"HEARTBEAT: re-join about every 20 seconds while actively working (presence fades after about 90 seconds); at minimum, re-join whenever you post after a pause.",
			"Your tunnel actions — file reads and writes, commands — appear in the room AUTOMATICALLY, attributed to you. Do not narrate every deed; your own room posts are for intent, coordination, warnings, blockers, and replies."
		],
		purpose: "Agents working the same tunnels divide the work, warn each other off collisions ('I am about to restart the service', 'I am mid-deploy, hold'), answer each other, and stay steerable by the owner, who watches the same room live in Tunnel Control."
	};
}

const ROOM_BEHAVIOR = Object.freeze([
	"SHARED ROOM FIRST: one room is shared by every agent on this account across all providers. Join it before other work (POST /api/tunnel/control/agent-room/join) and announce who you are and what you are doing.",
	"Live in the room while you work: on connect, FIRST read the room's backlog (GET /api/tunnel/control/agent-room, no since) — prior agents' completions, open questions, and owner steering are already there; do not redo finished work. Then poll it regularly; post before significant or destructive actions, after milestones, on blockers, and on completion; reply to other agents; treat the owner's room messages as live steering.",
	"Your tunnel actions appear in the room automatically, attributed to you — room posts are for intent, warnings, coordination, and replies. Room writes require the tunnel.mission scope. Full protocol: bootstrap.sharedRoom."
]);

module.exports = { ROOM_BEHAVIOR, roomProtocol };
