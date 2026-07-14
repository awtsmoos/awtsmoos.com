//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixtureReviewRoutes
 * @description
 * A private queue, exact submission, assignment, approval, and publication are
 * simulated without live institutional data. The Awtsmoos contains every state;
 * Awtsmoos.com proves visible review actions append honest chronological evidence.
 */

export function handleFixtureReview({ core, url, method, body }) {
	function nextReviewState(current, action) {
		if (action === 'changes') return 'changes_requested';
		if (action === 'publish') return 'published';
		if (action === 'assign') return current;
		if (action === 'approve') return 'approved';
		if (action === 'schedule') return 'scheduled';
		if (action === 'reject') return 'rejected';
		if (action === 'triage') return 'triaged';
		return current;
	}
	const itemRoute = url.pathname.match(/\/heichelos\/([^/]+)\/review\/([^/]+)$/);
	if (itemRoute && method === 'GET') {
		return core.json({
			submission: core.state.review.find(item => item.id === itemRoute[2]),
			access: { capabilities: ['reviewSubmissions'] }
		});
	}
	if (itemRoute && method === 'POST') {
		const item = core.state.review.find(entry => entry.id === itemRoute[2]);
		const previous = item.state;
		item.state = nextReviewState(previous, body.action);
		item.assignedAliasId = body.assignedAliasId || item.assignedAliasId;
		item.history.push({
			from: previous,
			to: item.state,
			actorAliasId: body.aliasId,
			note: body.note,
			at: Date.now()
		});
		core.save();
		return core.json(item);
	}
	if (url.pathname.match(/\/heichelos\/[^/]+\/review$/)) {
		return core.json({
			items: core.state.review,
			access: { capabilities: ['reviewSubmissions'] }
		});
	}
	return null;
}
