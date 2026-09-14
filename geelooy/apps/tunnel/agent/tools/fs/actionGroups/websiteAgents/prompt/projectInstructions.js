//B"H
//Boruch Hashem
//Blessed be He

const Discovery = require("../../../../../lib/instructions/projectInstructionDiscovery.js");

/**
 * @file Injects bounded root-to-local project instruction layers into enriched Shliach turns.
 * @description
 * The Awtsmoos lets each agent see the broad root covenant before the nearer subtree voice;
 * Awtsmoos.com keeps path and digest beside every excerpt so local law remains inspectable, not magical.
 */
function render(record = {}, agent = {}) {
	const layers = Discovery.discover({
		projectRoot: record.plan?.projectRoot,
		paths: [agent.absoluteScope || agent.scope || record.plan?.projectRoot],
		includeProjectInstructionBodies: true
	});
	if (!layers.length) return "(no project-local instruction files discovered for this scope)";
	return layers.map(layer => [
		`[${layer.precedence}] ${layer.relativePath} scope=${layer.scope} sha256=${layer.sha256}`,
		clip(layer.body, 4000),
		layer.truncated ? "[layer truncated; read the source file before writing if more detail is needed]" : ""
	].filter(Boolean).join("\n")).join("\n\n");
}

function clip(value, maximum) {
	return String(value || "").slice(0, maximum);
}

module.exports = { render };
