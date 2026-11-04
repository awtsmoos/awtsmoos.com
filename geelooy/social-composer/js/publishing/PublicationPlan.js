//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicationPlan
 * @description
 * The Awtsmoos gives one origin before many appearances; Awtsmoos.com turns draft state into one
 * canonical destination, typed mirrors, public audience truth, scheduling, and idempotent publication law.
 */
import { normalizeSocialVisibility } from './SocialPublicationPolicy.js';

function contentKind(snapshot) {
	if (snapshot.questionId) return 'answer';
	if (snapshot.postKind === 'question') return 'question';
	if (snapshot.presentationKind === 'image') return 'post';
	return snapshot.presentationKind || 'post';
}

function primaryDestination(snapshot) {
	const source = snapshot.canonicalSource;
	return {
		heichelId: source?.heichelId || snapshot.identity.heichelId,
		seriesId: source?.seriesId || snapshot.identity.seriesId || 'root',
		kind: 'canonical'
	};
}

function destinationKey(destination) {
	return [destination.heichelId, destination.seriesId || 'root', destination.kind || 'reference'].join(':');
}

function secondaryDestinations(snapshot) {
	const primary = primaryDestination(snapshot);
	const values = [...snapshot.secondaryDestinations];
	const selected = snapshot.identity;
	if (snapshot.canonicalSource && selected.heichelId && (
		selected.heichelId !== primary.heichelId
		|| selected.seriesId !== primary.seriesId
	)) {
		values.unshift({
			heichelId: selected.heichelId,
			heichelName: selected.heichelName,
			seriesId: selected.seriesId,
			seriesName: selected.seriesName,
			kind: 'reference',
			note: ''
		});
	}
	const unique = new Map();
	for (const value of values) {
		if (!value.heichelId) continue;
		if (value.heichelId === primary.heichelId && value.seriesId === primary.seriesId) continue;
		unique.set(destinationKey(value), {
			heichelId: value.heichelId,
			seriesId: value.seriesId || 'root',
			kind: value.kind || 'reference',
			note: value.note || ''
		});
	}
	return [...unique.values()];
}

/**
 * A source launched without its birthplace (a bare `?source=<id>` link, or a
 * restored draft saved by one) must not deadlock the composer: the plan's
 * primary destination already resolves to the source's Heichel when known
 * and to the chosen destination otherwise, so the source inherits that
 * Heichel. The server still verifies the record exists under it before
 * anything is reused — an inherited scope that names no record fails
 * honestly instead of publishing.
 */
function normalizedSource(snapshot, primary) {
	const source = snapshot.canonicalSource;
	if (!source?.id) return {};
	return {
		...source,
		heichelId: source.heichelId || primary.heichelId || '',
		seriesId: source.seriesId || primary.seriesId || 'root'
	};
}

export function buildPublicationPlan(snapshot) {
	const primary = primaryDestination(snapshot);
	return {
		version: 1,
		idempotencyKey: snapshot.publication.idempotencyKey,
		aliasId: snapshot.identity.aliasId,
		contentKind: contentKind(snapshot),
		primary,
		secondary: secondaryDestinations(snapshot),
		source: normalizedSource(snapshot, primary),
		parentQuestionId: snapshot.questionId || '',
		visibility: normalizeSocialVisibility(snapshot.publication?.visibility),
		scheduledAt: Number(snapshot.publication.scheduledAt || 0)
	};
}

export function publicationIssues(snapshot) {
	const plan = buildPublicationPlan(snapshot);
	const issues = [];
	if (!plan.aliasId) issues.push('Choose a verified posting alias.');
	if (!plan.primary.heichelId) issues.push('Choose the canonical Heichel.');
	if (!plan.primary.seriesId) issues.push('Choose the canonical series.');
	if (plan.contentKind === 'answer' && !plan.parentQuestionId) issues.push('Answers require a parent question.');
	if (plan.source.id && !plan.source.heichelId) issues.push('Existing content requires its canonical Heichel.');
	return issues;
}

export { contentKind, destinationKey, primaryDestination, secondaryDestinations, normalizedSource };
