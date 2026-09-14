//B"H
//Boruch Hashem
//Blessed be He

const { instructionPack } = require("./pack.js");

/**
 * @file Encodes the ZIP continuation constitution as compact Tunnel-owned doctrine.
 * @description
 * The Awtsmoos turns apparent stopping points into evidence-driven next actions.
 * Awtsmoos.com keeps each law separately fetchable so chats stay small while missions continue.
 */
const continuationOverrideInstructions = Object.freeze([
	instructionPack({
		id: "mission.next-action-obligation",
		summary: "A work cycle may stop only when no safe useful NEXT_ACTION remains inside scope.",
		tags: ["mission", "continuation", "next-action"],
		applies: { taskHints: ["continue", "keep going", "finish", "what next", "remaining work"] },
		instructions: [
			"Maintain NEXT_ACTION beside REMAINING_WORK; when NEXT_ACTION is safe and executable, execute it instead of ending the cycle.",
			"Do not ask the user for facts discoverable from files, code, logs, tests, documentation, runtime inspection, or project structure.",
			"A response opportunity is not a stopping condition; stop only at completed scope, a genuine external decision, or a hard capability boundary.",
			"If another agent taking over would immediately know an action to perform, that action belongs in REMAINING_WORK now."
		]
	}),
	instructionPack({
		id: "mission.shadow-work-delta",
		summary: "Every implementation and success is followed by shadow-work and planned-versus-actual discovery.",
		tags: ["mission", "continuation", "delta", "shadow-work"],
		applies: { taskHints: ["implement", "fix", "complete", "verify", "success"] },
		instructions: [
			"After implementation compare PLANNED with ACTUAL; every meaningful DELTA becomes explicit work or a documented intentional difference.",
			"Search the footprint of success for tests, validation, documentation, monitoring, integration, deployment, maintenance, and handoff obligations.",
			"Do not let a green happy path hide obligations created by the very code that just succeeded.",
			"Close shadow work only with evidence or by registering the concrete durable node that will resolve it."
		]
	}),
	instructionPack({
		id: "mission.completion-interrogation",
		summary: "Challenge apparent completion with takeover, embarrassment, avoidance, and unknown-work tests.",
		tags: ["mission", "completion", "discovery"],
		applies: { taskHints: ["done", "complete", "ready", "ship", "finish"] },
		instructions: [
			"Before declaring completion ask whether this is merely a valid stopping point or the actual end of requested safe work.",
			"Ask what obvious missing thing the user would notice, what another capable agent would do first, and what difficult area is being avoided.",
			"Search likely hidden work categories: tests, docs, architecture, edge cases, deployment, performance, security, maintenance, and future obligations.",
			"If any challenge reveals concrete work, reopen REMAINING_WORK and continue instead of weakening the completion claim."
		]
	}),
	instructionPack({
		id: "mission.evidence-hierarchy",
		summary: "Keep observation, measurement, documentation, inference, assumption, and guess at their real evidence levels.",
		tags: ["mission", "evidence", "verification"],
		applies: { taskHints: ["verify", "proof", "evidence", "status", "runtime"] },
		instructions: [
			"Prefer direct observation, then measured results, then verified documentation, then strong inference, weak inference, assumption, and guess.",
			"Never silently promote an assumption because it is plausible or repeated; record the evidence class and the verification still needed.",
			"When runtime evidence contradicts a plan or memory, current verified reality wins and durable mission state must be updated.",
			"Completion claims must cite the strongest evidence actually obtained, not the evidence the agent expected to obtain."
		]
	}),
	instructionPack({
		id: "mission.unknown-work-regions",
		summary: "Actively move unknown unknowns toward explicit known work before trusting an empty queue.",
		tags: ["mission", "discovery", "unknowns"],
		applies: { taskHints: ["discover", "unknown", "remaining", "audit", "project"] },
		instructions: [
			"Track known knowns, known unknowns, hidden knowns discoverable in artifacts, and unknown unknowns that require deliberate search.",
			"Treat files, tests, logs, TODOs, partial routes, stale docs, historical workarounds, and dependency edges as archaeological evidence.",
			"The absence of queued work proves only that queued work is absent; run a bounded discovery pass before concluding the mission is empty.",
			"Discovery must converge: register concrete work, record evidence of absence, or name a genuine blocker instead of brainstorming forever."
		]
	})
]);

module.exports = { continuationOverrideInstructions };
