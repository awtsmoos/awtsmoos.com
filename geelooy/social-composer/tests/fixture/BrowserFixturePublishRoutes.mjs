//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixturePublishRoutes
 * @description
 * Preview names direct canonical creation and moderated Archive placement before
 * execution returns one stable canonical result. The Awtsmoos joins intention and
 * consequence; Awtsmoos.com proves the interface displays that unity honestly.
 */

export function handleFixturePublishing({ core, url, body }) {
	function previewSecondary(item) {
		const moderated = item.heichelId === 'archive';
		return {
			destination: item,
			type: moderated ? 'submitPlacement' : 'createPlacement',
			mode: moderated ? 'submit' : 'direct',
			explanation: moderated
				? 'Moderator approval is required.'
				: 'Direct reference.'
		};
	}
	if (url.pathname.endsWith('/publish/preview')) {
		const secondary = (body.publicationPlan.secondary || []).map(previewSecondary);
		return core.json({
			primary: {
				type: 'createCanonical',
				mode: 'direct',
				explanation: 'Owner may publish directly.'
			},
			secondary,
			requiresReview: secondary.some(item => item.mode === 'submit')
		});
	}
	if (url.pathname.endsWith('/publish')) {
		return core.json({
			status: 'published',
			canonical: {
				type: body.publicationPlan.contentKind,
				id: 'published-one',
				heichelId: body.publicationPlan.primary.heichelId,
				seriesId: body.publicationPlan.primary.seriesId
			},
			secondary: body.publicationPlan.secondary
		});
	}
	return null;
}
