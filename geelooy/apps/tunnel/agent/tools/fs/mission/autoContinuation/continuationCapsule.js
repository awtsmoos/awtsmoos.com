//B"H
// Boruch Hashem
// Blessed is He

const Compiler = require("../../contextCompiler/compiler.js");

const MANDATE = "Continue the same mission. Rediscover missing work. Do not stop until completion debt is green and required verification passes.";

/**
 * @file Compiles one deterministic handoff capsule for a successor chat or website agent.
 * @description The Awtsmoos carries only durable published truth across incarnations;
 * Awtsmoos.com gives each successor a compiler watermark instead of a fragile chat transcript.
 */
function query(debt = {}) {
	return [
		"continue unfinished mission",
		...(debt.reasons || []),
		...(debt.remainingWork || []).map(item => item.title),
		...(debt.obligations || []).map(item => item.title)
	].filter(Boolean).join(" ");
}

function render(compiled, debt) {
	const sourceText = compiled.sources.map(source => {
		return `--- ${source.id} [${source.type}] ---\n${source.text}`;
	}).join("\n");
	return [
		MANDATE,
		`Completion debt: ${JSON.stringify(debt)}`,
		`Compiler: ${compiled.compilerVersion} hash=${compiled.hash} watermark=${compiled.watermark}`,
		sourceText
	].filter(Boolean).join("\n\n");
}

async function build(config, mission = {}, debt = {}, identity = {}) {
	const compiled = await Compiler.compile(config, {
		missionId: mission.missionId || mission.id || "",
		logicalAgentId: identity.logicalAgentId || identity.successorAgentId || "",
		query: query(debt),
		charBudget: 16000,
		mandatorySources: [{
			id: "continuation:completion-mandate",
			text: MANDATE
		}]
	});
	return {
		compilerVersion: compiled.compilerVersion,
		hash: compiled.hash,
		watermark: compiled.watermark,
		sourceIds: compiled.sources.map(source => source.id),
		text: render(compiled, debt)
	};
}

module.exports = { MANDATE, build, query, render };
