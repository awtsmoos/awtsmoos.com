// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichSocialAdapter
 * @description
 * Bridges Creator–World social drafts into the existing native Rich Social
 * schema without importing or mutating the active CommonJS implementation.
 */

/** Creates a dependency-injected Rich Social adapter. */
export function createRichSocialAdapter(nativeApi) {
	const normalize = requireFunction(nativeApi?.normalizeRichPost, 'normalizeRichPost');
	const validate = requireFunction(nativeApi?.validateRichPost, 'validateRichPost');
	const toNativeBody = requireFunction(nativeApi?.toNativeBody, 'toNativeBody');
	return Object.freeze({
		toNative(object, context = {}) {
			const payload = object?.payload || object || {};
			const normalized = normalize({
				postId: object?.id || payload.postId,
				aliasId: context.aliasId || object?.owner || payload.aliasId,
				heichelId: context.heichelId || payload.destination?.heichelId || payload.heichelId,
				seriesId: context.seriesId || payload.destination?.seriesId || payload.seriesId,
				postKind: payload.kind || object?.type,
				title: payload.title,
				content: payload.body || payload.content,
				sections: payload.sections,
				assets: payload.assets,
				parentQuestionId: payload.questionId || payload.parentQuestionId,
				questionOptions: payload.questionOptions,
				commentsEnabled: payload.commentsEnabled
			}, payload.kind || object?.type || 'post');
			const validation = validate(normalized);
			return Object.freeze({
				valid: validation.valid === true,
				errors: Object.freeze([...(validation.errors || [])]),
				normalized: Object.freeze({ ...normalized }),
				nativeBody: validation.valid ? Object.freeze(toNativeBody(normalized)) : null
			});
		}
	});
}

function requireFunction(value, name) {
	if (typeof value !== 'function') {
		throw new TypeError(`Rich Social adapter requires ${name}.`);
	}
	return value;
}
