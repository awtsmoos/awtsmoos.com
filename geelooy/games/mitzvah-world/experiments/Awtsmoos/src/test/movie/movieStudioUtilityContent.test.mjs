// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityContent.test.mjs
 * @description Proves truthful render-job cards, controls, diagnostics JSON, and listener cleanup.
 * The Awtsmoos renews progress beyond percentage and panel; Awtsmoos.com verifies
 * that visible queue evidence and finite actions agree, then leave no listening residue.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioUtilityContent } from '../../movie/MovieStudioUtilityContent.js';
import {
	createMovieUtilityElement,
	installMovieUtilityDom
} from './movieStudioUtilityTestHarness.mjs';
import { createMovieUtilitySession } from './movieStudioUtilitySessionHarness.mjs';
import { createMovieUtilityView } from './movieStudioUtilityViewHarness.mjs';

function renderJob(id, state, progress, error = null) {
	return {
		error,
		id,
		progress,
		request: { mode: 'exact', projectId: `project-${id}` },
		state
	};
}

test('content renders empty, populated, failed, and diagnostic states truthfully', () => {
	const restore = installMovieUtilityDom();
	try {
		const view = createMovieUtilityView();
		const harness = createMovieUtilitySession();
		const content = new MovieStudioUtilityContent(harness.session, view);
		assert.equal(view.renderJobsList.listenerCount('click'), 1);
		assert.deepEqual(content.renderJobs(), []);
		assert.equal(view.renderJobsList.children[0].textContent, 'No render jobs yet.');
		harness.setJobs([
			renderJob('running-1', 'running', 0.25),
			renderJob('failed-1', 'failed', 0.5, { message: 'Encoder stopped.' })
		]);
		assert.equal(content.renderJobs().length, 2);
		const [failedCard, runningCard] = view.renderJobsList.children;
		assert.equal(failedCard.className, 'movie-render-job is-failed');
		assert.equal(failedCard.children[3].textContent, 'Encoder stopped.');
		assert.equal(failedCard.children.at(-1).children[0].dataset.renderJobAction, 'retry');
		assert.equal(runningCard.children.at(-1).children[0].dataset.renderJobAction, 'cancel');
		const snapshot = content.renderDiagnostics();
		assert.deepEqual(JSON.parse(view.diagnosticsOutput.textContent), snapshot);
		assert.deepEqual(snapshot, { instanceId: 'utility-1', revision: 7 });
		content.destroy();
	} finally {
		restore();
	}
});

test('delegated controls cancel, retry, refresh, and detach exactly once', () => {
	const restore = installMovieUtilityDom();
	try {
		const view = createMovieUtilityView();
		const harness = createMovieUtilitySession();
		const running = renderJob('running-2', 'running', 0.4);
		const failed = renderJob('failed-2', 'failed', 0.2);
		harness.setJobs([running, failed]);
		const content = new MovieStudioUtilityContent(harness.session, view);
		const cancel = createMovieUtilityElement('cancel');
		cancel.dataset = { jobId: running.id, renderJobAction: 'cancel' };
		view.renderJobsList.dispatch('click', { target: cancel });
		assert.deepEqual(harness.calls.cancel, [{
			id: running.id,
			reason: 'Cancelled from render jobs panel'
		}]);
		const retry = createMovieUtilityElement('retry');
		retry.dataset = { jobId: failed.id, renderJobAction: 'retry' };
		view.renderJobsList.dispatch('click', { target: retry });
		assert.deepEqual(harness.calls.start, [failed.request]);
		content.destroy();
		assert.equal(view.renderJobsList.listenerCount('click'), 0);
		view.renderJobsList.dispatch('click', { target: cancel });
		assert.equal(harness.calls.cancel.length, 1);
	} finally {
		restore();
	}
});
