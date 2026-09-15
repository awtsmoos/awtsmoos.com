//B"H
//Boruch Hashem
//Blessed be He

const Budget = require("./budget.js");
const Ranking = require("./ranking.js");
const Source = require("./sourceModel.js");
const Sources = require("./sources.js");

const COMPILER_VERSION = "context-compiler-v1";

/**
 * @file Compiles mixed project truth into one deterministic, explainable context artifact.
 * @description The Awtsmoos gathers many vessels without confusing their identities;
 * Awtsmoos.com records watermark, budget, ranking reasons, and a reproducible result hash.
 */
function watermarkFor(sources = []) {
	const witness = sources.map(source => ({
		id: source.id,
		version: source.version,
		contentHash: source.contentHash,
		sequence: source.sequence
	})).sort((left, right) => left.id.localeCompare(right.id));
	return Source.stableDigest(witness);
}

function descriptor(source) {
	return {
		id: source.id,
		type: source.type,
		contentHash: source.contentHash,
		version: source.version,
		sequence: source.sequence,
		mandatory: source.mandatory,
		score: source.score,
		whyIncluded: source.whyIncluded,
		metadata: source.metadata
	};
}

async function compile(config, payload = {}) {
	const query = String(payload.query || payload.goal || "");
	const candidates = await Sources.gather(config, payload);
	const ranked = Ranking.rank(candidates, query);
	const chosen = Budget.select(
		ranked,
		payload.charBudget || payload.budgetChars
	);
	const watermark = watermarkFor(candidates);
	const selected = chosen.selected.map(descriptor);
	const hash = Source.stableDigest({
		compilerVersion: COMPILER_VERSION,
		query,
		watermark,
		budget: chosen.budget,
		selected
	});
	return {
		ok: true,
		compilerVersion: COMPILER_VERSION,
		generatedAt: new Date().toISOString(),
		query,
		watermark,
		hash,
		sourceCount: candidates.length,
		selectedCount: chosen.selected.length,
		budget: chosen.budget,
		sources: chosen.selected
	};
}

module.exports = { COMPILER_VERSION, compile, descriptor, watermarkFor };
