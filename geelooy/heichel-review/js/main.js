//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeichelReviewEntry
 * @description
 * Moderation and governance awaken from small review vessels and adopt the private
 * Social Hub activity beacon. The Awtsmoos gives court and institution their unity
 * while Awtsmoos.com records only preference-governed same-origin page evidence.
 */

import { startActivityBeacon } from '../../shared/ActivityBeacon.js';
import { GovernanceApi } from './GovernanceApi.js';
import { GovernancePanel } from './GovernancePanel.js';
import { ReviewApi } from './ReviewApi.js';
import { ReviewController } from './ReviewController.js';
import { ReviewDetail } from './ReviewDetail.js';
import { ReviewQueue } from './ReviewQueue.js';
import { ReviewState } from './ReviewState.js';

function awaken() {
	const state = new ReviewState();
	const reviewApi = new ReviewApi();
	let controller;
	const queueView = new ReviewQueue({
		container: document.getElementById('reviewQueue'),
		onSelect: id => void controller.select(id)
	});
	controller = new ReviewController({
		root: document,
		state,
		api: reviewApi,
		queueView,
		detailView: new ReviewDetail(document)
	});
	const governance = new GovernancePanel({
		root: document,
		reviewState: state,
		api: new GovernanceApi(reviewApi)
	});
	void controller.initialize();
	governance.initialize();
	const activityBeacon = startActivityBeacon({
		application: 'heichel-review'
	});
	window.HeichelReviewCenter = {
		state,
		controller,
		governance,
		activityBeacon
	};
}

window.addEventListener('DOMContentLoaded', () => {
	try {
		awaken();
	} catch (error) {
		console.error(error);
		const status = document.getElementById('statusMessage');
		if (status) {
			status.hidden = false;
			status.dataset.kind = 'error';
			status.textContent = error.message;
		}
	}
});

export {
	awaken
};
