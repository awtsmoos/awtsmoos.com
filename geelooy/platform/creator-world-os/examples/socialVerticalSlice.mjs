// B"H
// Boruch Hashem
// Blessed is He
/** @module SocialVerticalSlice @description Runs compose, native adaptation, discovery, search, and evidence as one flow. */
import { createQuestion } from '../social/questionObject.mjs';
import { createQueryPlan } from '../search/queryPlan.mjs';
import { createEvidenceManifest } from '../release/evidenceManifest.mjs';
import { createRadianceAdapter } from '../adapters/radianceAdapter.mjs';
import { createRichSocialAdapter } from '../adapters/richSocialAdapter.mjs';

/** Runs the first independently releasable creator-world vertical slice. */
export function runSocialVerticalSlice(input, nativeApi) {
	const question = createQuestion({
		owner: input.aliasId,
		title: input.title,
		body: input.body,
		sections: input.sections || [],
		assets: input.assets || [],
		visibility: input.visibility || 'public',
		metadata: { heichelId: input.heichelId }
	});
	const richSocial = createRichSocialAdapter(nativeApi.richSocial);
	const native = richSocial.toNative(question, {
		aliasId: input.aliasId,
		heichelId: input.heichelId,
		seriesId: input.seriesId || 'root'
	});
	if (!native.valid) {
		throw new TypeError(`Rich Social validation failed: ${native.errors.join(', ')}`);
	}
	const radiance = createRadianceAdapter(nativeApi.radiance);
	const ranked = radiance.rank([{ ...native.normalized, id: question.id }], { limit: 1 });
	const queryPlan = createQueryPlan({
		query: input.searchQuery || input.title,
		lanes: ['exact-text', 'source-range', 'vector', 'graph', 'permissions', 'radiance'],
		corpusPins: input.corpusPins || {},
		filters: { heichelId: input.heichelId }
	});
	const evidence = createEvidenceManifest({
		trainId: 'social',
		head: input.head || 'working-tree',
		tests: ['rich-social-validation', 'radiance-explanation', 'query-plan'],
		limitations: input.limitations || []
	});
	return Object.freeze({ question, native, ranked, queryPlan, evidence });
}
