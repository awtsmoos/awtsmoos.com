// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerValue
 * @description
 * One serializable covenant holds identity, content, destinations, and share-prefill.
 * The Awtsmoos gives unity; Awtsmoos.com lets publication state live in its own focused vessel.
 */
import { createBlock } from "../model/Ids.js";
import { PRESENTATION_KINDS } from "../config.js";
import { publicationValue, requestId } from "./PublicationValue.js";
import { sharePrefill } from "./SharePrefill.js";

function identity(value = {}) {
	return {
		aliasId: String(value.aliasId || ""),
		aliasName: String(value.aliasName || ""),
		heichelId: String(value.heichelId || ""),
		heichelName: String(value.heichelName || ""),
		seriesId: String(value.seriesId || "root"),
		seriesName: String(value.seriesName || (value.seriesId === "root" ? "Heichel Home" : "")),
		access: value.access && typeof value.access === "object" ? value.access : null
	};
}

function source(value) {
	if (!value?.id) {
		return null;
	}
	return {
		type: String(value.type || "post"),
		id: String(value.id),
		heichelId: String(value.heichelId || ""),
		seriesId: String(value.seriesId || "root"),
		aliasId: String(value.aliasId || "")
	};
}

function secondary(values = []) {
	return Array.isArray(values)
		? values.slice(0, 24).map(item => ({
			heichelId: String(item.heichelId || ""),
			heichelName: String(item.heichelName || ""),
			seriesId: String(item.seriesId || "root"),
			seriesName: String(item.seriesName || ""),
			kind: String(item.kind || "reference"),
			note: String(item.note || ""),
			access: item.access && typeof item.access === "object" ? item.access : null
		})).filter(item => item.heichelId)
		: [];
}

export function normalizeComposerValue(value = {}, context = {}) {
	const questionId = String(value.questionId || context.questionId || "");
	const postKind = resolvedPostKind(value, context, questionId);
	const presentation = value.presentationKind || context.presentationKind || postKind;
	const prefill = sharePrefill(context.share);
	const rootBlocks = Array.isArray(value.rootBlocks) && value.rootBlocks.length
		? value.rootBlocks
		: prefill?.rootBlocks || [createBlock()];
	return {
		version: 2,
		identity: identity(value.identity || context),
		postKind,
		presentationKind: PRESENTATION_KINDS.includes(presentation) ? presentation : postKind,
		questionId,
		title: String(value.title || prefill?.title || ""),
		summary: String(value.summary || prefill?.summary || ""),
		commentsEnabled: value.commentsEnabled !== false,
		questionOptions: questionOptions(value),
		rootBlocks,
		rootAttachments: Array.isArray(value.rootAttachments) ? value.rootAttachments : [],
		sections: Array.isArray(value.sections) ? value.sections : [],
		canonicalSource: source(value.canonicalSource || context.canonicalSource),
		secondaryDestinations: secondary(value.secondaryDestinations),
		publication: publicationValue(value),
		createdAt: Number(value.createdAt) || Date.now(),
		updatedAt: Number(value.updatedAt) || Date.now(),
		draftId: String(value.draftId || "")
	};
}

function resolvedPostKind(value, context, questionId) {
	if (questionId) {
		return "answer";
	}
	return ["post", "question", "answer"].includes(value.postKind)
		? value.postKind
		: context.postKind || "post";
}

function questionOptions(value) {
	return {
		answersEnabled: value.questionOptions?.answersEnabled !== false,
		answerPolicy: value.questionOptions?.answerPolicy || "open",
		answerGuidance: String(value.questionOptions?.answerGuidance || "")
	};
}

export {
	requestId,
	identity,
	source,
	secondary
};
