//B"H
//Boruch Hashem
//Blessed is He

import {
	allAttachments,
	payloadIssues
} from '../model/PostPayload.js';
import {
	buildPublicationPlan,
	publicationIssues
} from './PublicationPlan.js';

/**
 * @module PublicationReviewModel
 * @description
 * The Awtsmoos sees destination, audience, media, people, structure, disclosure, and timing as one deed;
 * Awtsmoos.com condenses that deed into review cards so final publication is understandable before it becomes irreversible seed.
 */
function uniqueIssues(snapshot) {
	return [
		...payloadIssues(snapshot),
		...publicationIssues(snapshot)
	].filter((item, index, values) => values.indexOf(item) === index);
}

function mediaSummary(snapshot) {
	const attachments = allAttachments(snapshot);
	const kinds = {};
	const roles = {};
	for (const item of attachments) {
		const type = item.type || 'file';
		const role = item.role || 'inline';
		kinds[type] = (kinds[type] || 0) + 1;
		roles[role] = (roles[role] || 0) + 1;
	}
	return {
		total: attachments.length,
		kinds,
		roles
	};
}

function joinedCounts(values = {}) {
	const entries = Object.entries(values);
	return entries.length
		? entries.map(([name, count]) => `${count} ${name}`).join(' · ')
		: 'None';
}

function reviewCards(snapshot) {
	const plan = buildPublicationPlan(snapshot);
	const creator = snapshot.creatorMetadata || {};
	const social = creator.social || {};
	const distribution = creator.distribution || {};
	const media = mediaSummary(snapshot);
	const collaborators = creator.collaborators || [];
	const cards = [
		card('Identity & destination', snapshot.identity.aliasName || snapshot.identity.aliasId || 'Alias not chosen', `${plan.primary.heichelId || 'No Heichel'} › ${plan.primary.seriesId || 'root'} · ${plan.secondary.length} secondary`),
		card('Audience & timing', plan.visibility, plan.scheduledAt ? new Date(plan.scheduledAt).toLocaleString() : 'Publish immediately'),
		card('Media', `${media.total} attachment${media.total === 1 ? '' : 's'}`, `${joinedCounts(media.kinds)} · ${joinedCounts(media.roles)}`),
		card('People', `${collaborators.length} collaborator${collaborators.length === 1 ? '' : 's'}`, collaborators.map(item => item.aliasId).join(', ') || 'No collaborators'),
		card('Accessibility & structure', `${snapshot.sections.length} section${snapshot.sections.length === 1 ? '' : 's'} · ${(creator.chapters || []).length} chapter${(creator.chapters || []).length === 1 ? '' : 's'}`, `${(creator.captionLanguages || []).join(', ') || 'No caption languages'} · ${creator.transcript ? 'Transcript included' : 'No transcript'}`),
		card('Disclosures', distribution.paidPromotion ? 'Paid promotion' : 'No paid promotion', `${distribution.alteredMediaDisclosure ? 'Altered media disclosed' : 'No altered-media disclosure'} · ${(social.contentWarnings || []).join(', ') || 'No content warnings'}`),
		card('Server verification', snapshot.publication?.lastPreview ? 'Verified preview available' : 'Not verified yet', previewDetail(snapshot.publication?.lastPreview))
	];
	return cards;
}

function card(title, value, detail) {
	return { title, value, detail };
}

function previewDetail(preview) {
	if (!preview) return 'Verify destinations before the final publish if you want the server disposition now.';
	return preview.requiresReview
		? 'Moderator review is expected.'
		: 'Direct publication is currently available.';
}

export function publicationReview(snapshot) {
	const issues = uniqueIssues(snapshot);
	return {
		ready: issues.length === 0,
		issues,
		cards: reviewCards(snapshot),
		plan: buildPublicationPlan(snapshot),
		preview: snapshot.publication?.lastPreview || null
	};
}

export {
	uniqueIssues,
	mediaSummary,
	reviewCards,
	joinedCounts
};
