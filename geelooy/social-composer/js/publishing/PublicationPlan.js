//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicationPlan
 * @description
 * Visible composer state becomes one canonical destination and many typed mirrors.
 * The Awtsmoos gives one origin before every appearance; Awtsmoos.com therefore
 * converts image presentation to content, preserves source birthplaces, and dedupes.
 */

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
	return [
		destination.heichelId,
		destination.seriesId || 'root',
		destination.kind || 'reference'
	].join(':');
}

function secondaryDestinations(snapshot) {
	const primary = primaryDestination(snapshot);
	const values = [...snapshot.secondaryDestinations];
	const selected = snapshot.identity;
	if (
		snapshot.canonicalSource
		&& selected.heichelId
		&& (
			selected.heichelId !== primary.heichelId
			|| selected.seriesId !== primary.seriesId
		)
	) {
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

export function buildPublicationPlan(snapshot) {
	return {
		version: 1,
		idempotencyKey: snapshot.publication.idempotencyKey,
		aliasId: snapshot.identity.aliasId,
		contentKind: contentKind(snapshot),
		primary: primaryDestination(snapshot),
		secondary: secondaryDestinations(snapshot),
		source: snapshot.canonicalSource || {},
		parentQuestionId: snapshot.questionId || '',
		visibility: snapshot.publication.visibility || 'public',
		scheduledAt: Number(snapshot.publication.scheduledAt || 0)
	};
}

export function publicationIssues(snapshot) {
	const plan = buildPublicationPlan(snapshot);
	const issues = [];
	if (!plan.aliasId) issues.push('Choose a verified posting alias.');
	if (!plan.primary.heichelId) issues.push('Choose the canonical Heichel.');
	if (!plan.primary.seriesId) issues.push('Choose the canonical series.');
	if (plan.contentKind === 'answer' && !plan.parentQuestionId) {
		issues.push('Answers require a parent question.');
	}
	if (plan.source.id && !plan.source.heichelId) {
		issues.push('Existing content requires its canonical Heichel.');
	}
	return issues;
}

export {
	contentKind,
	primaryDestination,
	destinationKey,
	secondaryDestinations
};
