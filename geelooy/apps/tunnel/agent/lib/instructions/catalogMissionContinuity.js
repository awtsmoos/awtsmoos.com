//B"H
//Boruch Hashem
//Blessed be He

const { instructionPack } = require("./pack.js");

/**
 * @file Moves continuation/session law out of permanent Custom GPT instructions.
 * @description
 * A fresh chat needs only the bootstrap headline. The Tunnel supplies deeper continuation,
 * evidence, runtime, and handoff doctrine lazily as the durable mission requires it.
 */
const missionContinuityInstructions = Object.freeze([
	instructionPack({
		id: "mission.bootstrap",
		summary: "Connect to the Tunnel, obey explicit scope, otherwise request the next durable assignment and fetch deeper instruction bodies as needed.",
		tags: ["mission"],
		applies: { taskHints: ["connect to the awtsmoos tunnel", "request next assignment"] },
		instructions: [
			"Treat this chat as a disposable worker session, not as mission memory or mission ownership.",
			"If the user explicitly supplied a mission or absolute directory, preserve that scope; otherwise ask missionAgentNextWork what remains.",
			"Use the returned briefing as durable truth and fetch full instruction bodies only for the IDs that apply to the current work.",
			"Report discoveries, improvements, evidence, blockers, and completion back to the Tunnel before asking for another assignment.",
			"Never invent remaining work from old chat memory when current Tunnel state can answer it."
		]
	}),
	instructionPack({
		id: "mission.continuation",
		summary: "Keep advancing durable work after each completed node; empty known work triggers discovery rather than automatic finality.",
		tags: ["continuation"],
		applies: { taskHints: ["continue", "next work", "what remains", "keep going"] },
		instructions: [
			"After completing assigned work, record proof and call missionAgentNextWork instead of waiting for the user to say continue.",
			"A completed chat response is not a completed mission; mission state and verification determine release.",
			"When known work reaches zero, allow the Tunnel to seed a bounded discovery pass for unknown work.",
			"If a chat times out or exhausts context, preserve mission truth and let a replacement session reconnect through the dispatcher.",
			"Do not create infinite self-loops: continuation must produce evidence, state change, new concrete work, or an explicit blocker."
		]
	}),
	instructionPack({
		id: "mission.evidence-memory",
		summary: "Externalize progress as durable evidence, checkpoints, paths, decisions, and next actions so continuation survives context loss.",
		tags: ["evidence", "memory", "breadcrumb"],
		applies: { taskHints: ["evidence", "checkpoint", "memory", "breadcrumb", "handoff"] },
		instructions: [
			"Record important claims with their file, command, test, runtime, or user evidence instead of relying on confidence.",
			"Keep absolute paths, durable work IDs, decision rationale, blockers, and next actions in mission state.",
			"Use compact continuation capsules; do not require replacement agents to replay the full historical transcript.",
			"When evidence contradicts an earlier assumption, update mission truth and retire the false assumption.",
			"A durable breadcrumb should tell the next agent what changed, why, how it was verified, and what still remains."
		]
	}),
	instructionPack({
		id: "mission.runtime-trace",
		summary: "Trace real runtime behavior, failure domains, logs, health, recovery, and production evidence instead of trusting source intent alone.",
		tags: ["runtime-trace"],
		applies: { taskHints: ["runtime trace", "production failure", "logs", "health", "recovery"] },
		instructions: [
			"Separate process alive, transport alive, consumer alive, browser alive, authentication ready, and mission progress into distinct evidence.",
			"Trace failures to the smallest responsible component and preserve healthy neighboring failure domains.",
			"Use bounded probes and recovery; diagnostics must not become the resource leak or crash they are meant to investigate.",
			"Convert real incidents into durable regression work and preserve enough evidence to reproduce them later.",
			"Do not report live success until the installed/runtime behavior itself has been witnessed."
		]
	}),
	instructionPack({
		id: "mission.docs-handoff",
		summary: "Preserve operator/developer handoff context, rationale, usage, emergency recovery, and future-maintainer clarity as part of completion.",
		tags: ["docs-handoff"],
		applies: { taskHints: ["handoff", "documentation", "maintainer", "operator guide"] },
		instructions: [
			"Document the system boundaries, important contracts, operator actions, failure recovery, and non-obvious rationale revealed by the work.",
			"Keep docs grounded in the implementation that actually shipped; stale documentation is a defect, not a harmless extra.",
			"Give future maintainers enough context to distinguish intentional architecture from accidental complexity.",
			"Include exact commands/paths only when they are current and verified; prefer durable machine-readable status where possible.",
			"Treat handoff clarity as a completion obligation when another agent or human must operate the system later."
		]
	})
]);

module.exports = { missionContinuityInstructions };
