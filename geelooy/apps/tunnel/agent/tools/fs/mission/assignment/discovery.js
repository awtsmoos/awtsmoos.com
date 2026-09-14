//B"H
//Boruch Hashem
//Blessed be He

const Work = require("../workRegistry.js");
const Paths = require("./paths.js");

const FAMILIES = Object.freeze([
	["project-revelation", "Reveal the real project graph, dependencies, unknowns, and hidden obligations."],
	["unfinished-work", "Search existing code, tests, docs, logs, TODOs, and partial flows for unfinished work."],
	["verification-gaps", "Find missing tests, unverified failure paths, release gaps, and claims without evidence."],
	["docs-handoff", "Find missing documentation, rationale, handoff context, and future-maintainer confusion."],
	["runtime-trace", "Trace live/runtime behavior, observability gaps, recovery paths, and production-only failures."],
	["technical-debt", "Find fragile architecture, duplication, performance debt, security debt, and maintenance hazards."],
	["research-future", "Identify research questions, future evolution, scaling needs, and likely next-user requests."],
	["knowledge-graph", "Connect files, decisions, evidence, agents, dependencies, and remaining work into durable context."],
	["completion-challenge", "Assume the project is not finished; try to disprove completion before release."]
]);

/**
 * @file Seeds bounded unknown-work discovery when known REMAINING_WORK reaches zero.
 * @description
 * Empty known work is not completion testimony. The Tunnel opens a finite archaeology
 * pass, then agents must convert discoveries into concrete work or close them with proof.
 */
function seed(mission, config, input = {}) {
	const anchors = Paths.ensure(config, mission, input);
	const created = [];
	for (const [family, description] of FAMILIES) {
		const result = Work.register(mission, anchors.projectRoot, {
			idempotencyKey: `auto-discovery:${family}`,
			title: `Discovery: ${family}`,
			description,
			state: "discovered",
			priority: family === "unfinished-work" ? "high" : "normal",
			absolutePaths: [anchors.projectRoot],
			origin: "tunnel-auto-discovery",
			nextAction: {
				action: "instructionResolve",
				task: description,
				paths: [anchors.projectRoot],
				tags: [family, "mission-discovery"]
			}
		});
		created.push(result.item);
	}
	mission.assignment ||= {};
	mission.assignment.lastDiscoveryAt = new Date().toISOString();
	mission.assignment.discoveryGeneration = Number(mission.assignment.discoveryGeneration || 0) + 1;
	return { created, ...anchors };
}

module.exports = { FAMILIES, seed };
