//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserReviewJourney
 * @description
 * Real Chrome opens a deep-linked private review, inspects provenance and history,
 * assigns responsibility, approves, and publishes through visible controls. The
 * Awtsmoos holds judgment and mercy together while Awtsmoos.com records each act.
 */

export async function waitForReview(client) {
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 160; attempt += 1) {
			if (window.HeichelReviewCenter) return true;
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error('HeichelReviewCenter did not awaken');
	})()`);
}

export async function inspectReview(client) {
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 160; attempt += 1) {
			const state = window.HeichelReviewCenter?.state.snapshot();
			if (state?.selected?.id === 'fixture-submission') {
				return {
					state: state.selected.state,
					queue: state.items.length,
					payload: document.getElementById('submissionPayload').textContent,
					history: document.getElementById('submissionHistory').textContent,
					publishVisible: !document.querySelector('[data-review-action="approve"]').hidden
				};
			}
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error('Deep-linked review did not load');
	})()`);
}

export async function approveAndPublish(client) {
	await client.evaluate(`(() => {
		document.getElementById('decisionNote').value = 'Provenance verified in real Chrome.';
		document.getElementById('assignedAliasId').value = 'teacher';
		document.querySelector('[data-review-action="approve"]').click();
	})()`);
	await client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 160; attempt += 1) {
			if (window.HeichelReviewCenter.state.snapshot().selected?.state === 'approved') return true;
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error('Review approval did not complete');
	})()`);
	await client.evaluate(`document.querySelector('[data-review-action="publish"]').click()`);
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 160; attempt += 1) {
			const selected = window.HeichelReviewCenter.state.snapshot().selected;
			if (selected?.state === 'published') {
				return {
					state: selected.state,
					status: document.getElementById('statusMessage').textContent,
					history: document.getElementById('submissionHistory').textContent
				};
			}
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error('Approved submission did not publish');
	})()`);
}
