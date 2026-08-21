//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PostPayload
 * @description
 * The Awtsmoos gathers a draft into one canonical rich-content covenant; Awtsmoos.com sends only capabilities
 * the server can really manifest: public publication, traceably owned copied media, structured content, and creator law.
 */
import { attachmentOwnedByAlias } from '../clone/CloneAttachmentWalker.js';
import { normalizeSocialVisibility } from '../publishing/SocialPublicationPolicy.js';
import { allAttachments, documentPayload, publishedAttachments, sectionPayload } from './PostPayloadParts.js';

export function buildPostPayload(snapshot) {
	const kind = snapshot.questionId ? 'answer' : snapshot.postKind;
	return {
		aliasId: snapshot.identity.aliasId,
		heichelId: snapshot.identity.heichelId,
		seriesId: snapshot.identity.seriesId || 'root',
		postKind: kind,
		presentationKind: snapshot.presentationKind || kind,
		parentQuestionId: snapshot.questionId,
		title: snapshot.title,
		summary: snapshot.summary,
		rootDocument: documentPayload(snapshot.rootBlocks),
		rootAssets: publishedAttachments(snapshot.rootAttachments),
		sections: snapshot.sections.map(sectionPayload),
		commentsEnabled: snapshot.commentsEnabled,
		visibility: normalizeSocialVisibility(snapshot.publication?.visibility),
		creatorMetadata: snapshot.creatorMetadata || {},
		cloneSource: snapshot.cloneSource || undefined,
		questionOptions: kind === 'question' ? snapshot.questionOptions : undefined
	};
}

export function payloadIssues(snapshot) {
	const issues = [];
	if (!snapshot.identity.aliasId) issues.push('Choose the posting alias.');
	if (!snapshot.identity.heichelId) issues.push('Choose the canonical Heichel.');
	if (!snapshot.title.trim()) issues.push('Add a title.');
	const hasText = snapshot.rootBlocks.some(block => block.text.trim());
	const hasSections = snapshot.sections.length > 0;
	const hasMedia = snapshot.rootAttachments.length > 0;
	if (!hasText && !hasSections && !hasMedia) issues.push('Add text, media, or a verse.');
	if (snapshot.questionId && snapshot.postKind !== 'answer') issues.push('Answer mode must remain attached to its question.');
	const attachments = allAttachments(snapshot);
	const pending = attachments.filter(attachment => attachment.status !== 'uploaded' && !attachment.publicPath);
	if (pending.length) issues.push(`${pending.length} attachment(s) still need upload.`);
	const unresolved = attachments.filter(attachment => attachment.ownershipState === 'unresolved');
	if (unresolved.length) {
		issues.push(`${unresolved.length} copied media item(s) need removal or replacement because their source cannot be verified.`);
	}
	const borrowed = attachments.filter(attachment =>
		attachment.cloneAssetSource
		&& !attachmentOwnedByAlias(attachment, snapshot.identity.aliasId)
	);
	if (borrowed.length) issues.push(`${borrowed.length} copied media item(s) still need ownership transfer or removal.`);
	return issues;
}

export { allAttachments, documentPayload, publishedAttachments, sectionPayload } from './PostPayloadParts.js';
