//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ContentPublisher
 * @description
 * One native creation current receives the validated rich document and returns
 * its true canonical identity. The Awtsmoos clothes one thought as post, question,
 * answer, or quote while Awtsmoos.com refuses to build a rival content database.
 */

const { createRichPostService } = require('../../richSocial/index.js');
const { addGraphReference } = require('../../socialGraph.js');
const { canonicalFromRecord } = require('./CanonicalLocator.js');
const { parse } = require('./PublicationPlanSchema.js');

function contentPayload($i, plan) {
	const raw = parse(
		$i.$_POST?.contentPayload,
		$i.$_POST?.content && typeof $i.$_POST.content === 'object'
			? $i.$_POST.content
			: $i.$_POST
	);
	return {
		...(raw || {}),
		aliasId: plan.aliasId,
		seriesId: plan.primary.seriesId,
		postKind: plan.contentKind === 'question' ? 'question' : 'post',
		parentQuestionId: plan.parentQuestionId,
		presentationKind: plan.contentKind,
		visibility: plan.visibility
	};
}

function inputWithContent($i, payload) {
	return {
		...$i,
		$_POST: payload,
		$_GET: { ...($i.$_GET || {}) },
		$_QUERY: { ...($i.$_QUERY || {}) }
	};
}

async function connectQuote({ $i, plan, canonical }) {
	if (plan.contentKind !== 'quote' || !plan.source?.id) return null;
	return addGraphReference({
		$i,
		kind: 'quotes',
		aliasId: plan.aliasId,
		from: canonical,
		to: plan.source,
		excerpt: '',
		note: 'Quoted through the unified publication flow.'
	});
}

async function publishCanonical({ $i, plan }) {
	const service = createRichPostService();
	const payload = contentPayload($i, plan);
	const input = inputWithContent($i, payload);
	const result = plan.contentKind === 'answer'
		? await service.createAnswer({
			$i: input,
			heichelId: plan.primary.heichelId,
			questionId: plan.parentQuestionId
		})
		: await service.createPost({
			$i: input,
			heichelId: plan.primary.heichelId,
			seriesId: plan.primary.seriesId
		});
	if (result?.error) return result;
	const record = result?.success || result;
	const canonical = canonicalFromRecord(record, {
		type: plan.contentKind === 'question' ? 'question' : plan.contentKind === 'answer' ? 'answer' : 'post',
		heichelId: plan.primary.heichelId,
		seriesId: plan.primary.seriesId,
		aliasId: plan.aliasId
	});
	const quoteGraph = await connectQuote({ $i, plan, canonical });
	return { success: { record, canonical, quoteGraph } };
}

module.exports = {
	contentPayload,
	inputWithContent,
	connectQuote,
	publishCanonical
};
