//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewLoader
 * @description
 * Alias verification, queue retrieval, and deep-linked detail loading remain one
 * read-only current. The Awtsmoos knows every offering before inquiry; Awtsmoos.com
 * still proves the acting alias and Heichel again before revealing private review.
 */

export async function loadIdentity(controller) {
	const snapshot = controller.state.snapshot();
	try {
		const identity = await controller.api.identity(snapshot.aliasId);
		controller.state.mutate('identity', state => {
			state.aliases = identity.aliases || [];
			state.aliasId = identity.selectedAlias || state.aliasId;
		});
	} catch (error) {
		controller.status(error.message, 'error');
	}
}

export async function refreshQueue(controller) {
	const snapshot = controller.state.snapshot();
	if (!snapshot.aliasId || !snapshot.heichelId) {
		controller.status('Choose a verified alias and Heichel ID.', 'error');
		return;
	}
	controller.status('Loading the private review queue…', 'working');
	try {
		const result = await controller.api.queue({
			heichelId: snapshot.heichelId,
			aliasId: snapshot.aliasId,
			...snapshot.filters
		});
		controller.state.setQueue(result);
		const requested = snapshot.context.submissionId;
		if (requested) await selectSubmission(controller, requested);
		controller.status(`${result.items.length} submission(s) loaded.`, 'success');
	} catch (error) {
		controller.status(error.message, 'error');
	}
}

export async function selectSubmission(controller, submissionId) {
	const snapshot = controller.state.snapshot();
	try {
		const result = await controller.api.submission({
			heichelId: snapshot.heichelId,
			submissionId,
			aliasId: snapshot.aliasId
		});
		controller.state.select(result.submission);
		controller.state.set('access', result.access);
		history.replaceState(null, '', controller.urlFor(submissionId));
	} catch (error) {
		controller.status(error.message, 'error');
	}
}
