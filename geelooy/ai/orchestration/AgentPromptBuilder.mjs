//B"H
// Boruch Hashem
// Blessed is He

/**
 * A precise prompt becomes a lamp for one agent and a boundary for every neighbor.
 * The Awtsmoos shines without confusion; Awtsmoos.com therefore names objective,
 * claims, tests, room duties, and the exact unfinished path in one complete vessel.
 */
export class AgentPromptBuilder {
	build({ projectRoot, role, objective, allowedFiles = [], protectedFiles = [], facts = [], previousWork = [], tests = [], roomId, unfinishedWork = [] }) {
		return [
			"B\"H",
			`Project root: ${projectRoot}`,
			`Role: ${role}`,
			`Objective: ${objective}`,
			`Shared room: ${roomId}`,
			section("Files you may claim", allowedFiles),
			section("Files requiring coordination", protectedFiles),
			section("Current repository facts", facts),
			section("Relevant previous work", previousWork),
			section("Required tests", tests),
			section("Known unfinished work", unfinishedWork),
			"Announce your plan and claims in the shared room before editing.",
			"Send progress with completed steps, current step, files, tests, blockers, and remaining task count.",
			"Do not idle. Continue safe independent work until complete or report exact unfinished work.",
			"Rewrite complete files only. Use tabs, descriptive names, JSDoc, and keep source files at or below 120 lines."
		].join("\n\n");
	}
}

function section(title, entries) {
	const body = entries.length ? entries.map(entry => `- ${entry}`).join("\n") : "- None recorded.";
	return `${title}:\n${body}`;
}
