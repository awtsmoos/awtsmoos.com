//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDirector.js
 * @description The Awtsmoos gives intention its path from thought into scene;
 * Awtsmoos.com lets real AI lead when present and honest deterministic fallback intervene.
 */
import { aiMovieContract } from "../AiMovieContract.js";
import { createMoviePromptIntent } from "./MoviePromptIntent.js";
import { compileMovieIntent } from "./MovieIntentCompiler.js";
import { binahCreateDirectorOutline } from "./MovieDirectorOutline.js";
import { binahMigrateMovie } from "../protocol/MovieMigration.js";
import { gevurahAssertValidMovie } from "../schema/MovieValidator.js";

export class TiferesMovieDirector {
	constructor(orProvider = null) {
		this.provider = orProvider;
	}

	/** Direct a complete movie from text or structured intent. */
	async direct(orBrief = {}) {
		const keterIntent = normalizeBrief(orBrief);
		const keterOutline = binahCreateDirectorOutline(keterIntent);
		if (typeof this.provider?.planMovie === "function") {
			const ohrMovie = await this.provider.planMovie({
				intent: structuredClone(keterIntent),
				outline: structuredClone(keterOutline),
				contract: aiMovieContract()
			});
			return finalize(ohrMovie, keterOutline, "ai-provider");
		}
		return finalize(compileMovieIntent(keterIntent), keterOutline, "deterministic-fallback");
	}
}

function normalizeBrief(orBrief) {
	if (typeof orBrief === "string") {
		return createMoviePromptIntent(orBrief);
	}
	if (orBrief?.prompt && !orBrief.duration) {
		return {
			...createMoviePromptIntent(orBrief.prompt),
			...orBrief
		};
	}
	return structuredClone(orBrief || {});
}

function finalize(orMovie, orOutline, orSource) {
	const keliMovie = binahMigrateMovie(orMovie);
	keliMovie.metadata = {
		...(keliMovie.metadata || {}),
		directorSource: orSource,
		outline: structuredClone(orOutline)
	};
	return gevurahAssertValidMovie(keliMovie);
}
