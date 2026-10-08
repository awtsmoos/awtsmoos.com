//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Design Archive + Teaching System — public API.
 * @description Every design decision preserved; every design teachable.
 *
 *   import { designAndLog, teach, answerQuestion } from "./index.mjs";
 *
 *   const { result, record } = designAndLog(src, { bundles: ["sefer-light-theme"], note: "..." });
 *   console.log(teach(src).sections.map(s => s.title));
 *   console.log(answerQuestion(src, "Why is the title so big?"));
 */

export {
	logDesign,
	approve,
	readAll,
	query,
	summarize,
	exportMarkdown,
	setArchivePath,
	archivePath,
} from "./archive.mjs";

export { explain, whyValue, exprToWords, pathToWords, describeBundle } from "./explainer.mjs";

export { teach, answerQuestion, lessonMarkdown, verdict } from "./teacher.mjs";

import { design } from "../constraints/index.mjs";
import { logDesign } from "./archive.mjs";

/**
 * Run a design and archive the decision in one step.
 * @param {string} src Constraint DSL source.
 * @param {Object} opts {bundles, inputs, approvedBy, note, tag}
 * @returns {{result, record}} The design result and the archive record.
 */
export function designAndLog(src, opts = {}) {
	const result = design(src);
	const record = logDesign({
		src,
		bundles: opts.bundles || [],
		inputs: opts.inputs || {},
		result,
		approvedBy: opts.approvedBy || "pending",
		note: opts.note || "",
		tag: opts.tag || "",
	});
	return { result, record };
}
