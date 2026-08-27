//B"H
// Boruch Hashem
// Blessed is He

/**
 * Prompts remain inside the living run and never enter events or reports.
 * The Awtsmoos lets Awtsmoos.com choose graph, cycle, random, or single text,
 * replacing only the public turn marker before the direct request is formed.
 */
function chooseAutomationPrompt(run, turn) {
	const graphPrompt = chooseGraphPrompt(run.graph);
	const settingsPrompt = chooseSettingsPrompt(run.settings, turn);
	return template(graphPrompt || settingsPrompt || run.settings.prompt, turn);
}

function chooseGraphPrompt(graph) {
	const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
	const start = graph?.start;
	const node = nodes.find(item => item.id === start)
		|| nodes.find(item => item.type === "send");
	return typeof node?.prompt === "string" ? node.prompt : "";
}

function chooseSettingsPrompt(settings, turn) {
	const prompts = String(settings.promptListText || "")
		.split(/\r?\n/)
		.map(value => value.trim())
		.filter(Boolean);
	if (!prompts.length || settings.promptMode === "single") {
		return settings.prompt;
	}
	if (settings.promptMode === "random") {
		return prompts[Math.floor(Math.random() * prompts.length)];
	}
	return prompts[(Math.max(1, turn) - 1) % prompts.length];
}

function template(value, turn) {
	return String(value || "continue").replace(/\{\{turn\}\}/g, String(turn));
}

module.exports = { chooseAutomationPrompt };
