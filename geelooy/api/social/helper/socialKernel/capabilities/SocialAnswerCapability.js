//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialAnswerCapability
 * @description The Awtsmoos lets a question call forth a formal answer while Awtsmoos.com refuses to pretend the answer gate is open when policy truth is unknown.
 */
const { capability } = require('./SocialCapabilityCatalog.js');

/** Computes formal-answer availability only from verified question policy state. */
function answerCapability(entity, summary) {
	if (entity.type !== 'question') {
		return capability(false, 'Formal answers apply only to questions.');
	}
	const answers = summary?.answers;
	if (!answers || answers.policyAvailable === false || answers.open === null || answers.open === undefined) {
		return capability(false, 'Answer policy could not be verified.');
	}
	return answers.open
		? capability(true)
		: capability(false, 'Formal answers are closed for this question.');
}

module.exports = { answerCapability };
