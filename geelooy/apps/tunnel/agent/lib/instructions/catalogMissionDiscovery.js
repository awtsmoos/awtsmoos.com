//B"H
//Boruch Hashem
//Blessed be He

const { instructionPack } = require("./pack.js");

/**
 * @file Converts project-revelation knowledge into lazy mission doctrine.
 * @description
 * Each chapter is independently discoverable. Agents receive matching headlines first,
 * then fetch the full body only when their durable work enters that discovery region.
 */
const missionDiscoveryInstructions = Object.freeze([
	instructionPack({
		id: "mission.project-revelation",
		summary: "Reveal the hidden project graph, unknowns, dependencies, risks, and evidence before treating a request as complete.",
		tags: ["project-revelation"],
		applies: { taskHints: ["project graph", "hidden obligations", "unknowns", "dependencies"] },
		instructions: [
			"Treat the visible request as a surface signal; inspect repository and runtime reality before defining the real work boundary.",
			"Map files, modules, APIs, tests, data flows, deployment paths, user expectations, and dependencies touched by the goal.",
			"Separate observations, inferences, assumptions, and unknowns; reduce discoverable unknowns before asking the user.",
			"Turn every concrete obligation into durable REMAINING_WORK with absolute paths and a verification method.",
			"Preserve evidence so replacement agents can continue without transcript memory."
		]
	}),
	instructionPack({
		id: "mission.unfinished-work",
		summary: "Hunt unknown work through archaeology, dependency shadows, missing tests/docs, and failure reconstruction.",
		tags: ["unfinished-work"],
		applies: { taskHints: ["unfinished work", "remaining work", "missing work", "archaeology"] },
		instructions: [
			"Absence of known work is not completion evidence; search files, tests, logs, docs, TODOs, partial routes, and abandoned flows.",
			"Inspect every implementation footprint for shadow obligations: tests, validation, monitoring, docs, integration, deployment, and maintenance.",
			"Imagine production failure and reconstruct causes that current work may not address.",
			"Imagine future users and maintainers; convert concrete confusion or fragility into durable work.",
			"Close discovery only with evidence or by registering the concrete work it revealed."
		]
	}),
	instructionPack({
		id: "mission.completion-gate",
		summary: "Challenge apparent completion with evidence, verification, maintainability, and failure-path tests before release.",
		tags: ["completion-challenge", "completion-gate"],
		applies: { taskHints: ["completion", "complete", "release gate", "ready to ship"] },
		instructions: [
			"Code written is not work complete; require the declared verification method and durable evidence for critical work nodes.",
			"Re-read touched files and compare planned versus actual behavior, including failure paths and compatibility surfaces.",
			"Run missing-test, missing-documentation, future-user, future-developer, and failure-reconstruction challenges.",
			"If a challenge reveals work, reopen REMAINING_WORK instead of weakening the gate.",
			"Only a clean work graph plus proof may authorize release."
		]
	}),
	instructionPack({
		id: "mission.technical-research",
		summary: "Search technical debt, performance/security risk, research questions, and future evolution as explicit work families.",
		tags: ["technical-debt", "research-future"],
		applies: { taskHints: ["technical debt", "performance debt", "research", "future evolution", "scaling"] },
		instructions: [
			"Inspect duplication, brittle ownership, hidden coupling, resource pressure, security boundaries, and maintenance cost.",
			"Distinguish evidence-backed debt from speculative preference; register only concrete, explainable obligations.",
			"Capture research questions whose answers materially affect architecture, verification, scale, or user experience.",
			"Record likely future requirements without letting speculative work outrank present correctness and stability.",
			"Attach every accepted debt/research item to absolute project paths and a next verification step."
		]
	}),
	instructionPack({
		id: "mission.knowledge-graph",
		summary: "Connect files, evidence, agents, decisions, dependencies, blockers, and remaining work into durable navigable context.",
		tags: ["knowledge-graph"],
		applies: { taskHints: ["knowledge graph", "handoff context", "connect evidence", "project memory"] },
		instructions: [
			"Represent important relationships explicitly: work depends on work, evidence supports claims, agents own leases, and files anchor implementation.",
			"Keep durable IDs stable across chat replacement so context can be reassembled without the old conversation.",
			"Prefer compact structured records over giant narrative transcripts; preserve deep bodies behind IDs when needed.",
			"Make every continuation capsule answer what exists, what remains, what changed, who knows what, and what should happen next.",
			"Never allow stale chat memory to outrank current files, runtime evidence, or durable mission state."
		]
	})
]);

module.exports = { missionDiscoveryInstructions };
