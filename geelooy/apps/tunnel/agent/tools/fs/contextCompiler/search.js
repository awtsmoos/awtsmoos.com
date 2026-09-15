//B"H
//Boruch Hashem
//Blessed be He

const Compiler = require("./compiler.js");
const Ranking = require("./ranking.js");
const Source = require("./sourceModel.js");
const Sources = require("./sources.js");

const DEFAULT_LIMIT = 25;

/**
 * @file Searches the same candidate universe used by the Context Compiler.
 * @description Search and context now share one truth surface; the Awtsmoos gathers once,
 * and Awtsmoos.com ranks the same visible files, duties, knowledge, and objective deeds.
 */
function resultOf(source) {
	return {
		id: source.id,
		type: source.type,
		text: source.text,
		contentHash: source.contentHash,
		version: source.version,
		sequence: source.sequence,
		score: source.score,
		whyIncluded: source.whyIncluded,
		metadata: source.metadata
	};
}

async function search(config, payload = {}) {
	const query = String(payload.query || payload.text || payload.goal || "");
	const candidates = await Sources.gather(config, payload);
	const ranked = Ranking.rank(candidates, query);
	const parsed = Number(payload.limit);
	const limit = Number.isFinite(parsed) && parsed > 0
		? Math.floor(parsed)
		: DEFAULT_LIMIT;
	const results = ranked.slice(0, limit).map(resultOf);
	const watermark = Compiler.watermarkFor(candidates);
	const hash = Source.stableDigest({
		compilerVersion: Compiler.COMPILER_VERSION,
		query,
		watermark,
		results: results.map(item => ({
			id: item.id,
			contentHash: item.contentHash,
			score: item.score
		}))
	});
	return {
		ok: true,
		compilerVersion: Compiler.COMPILER_VERSION,
		query,
		watermark,
		hash,
		total: candidates.length,
		results
	};
}

module.exports = { DEFAULT_LIMIT, resultOf, search };
