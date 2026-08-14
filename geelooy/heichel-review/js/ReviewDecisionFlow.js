//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReviewDecisionFlow
 * @description
 * The Awtsmoos joins judgment and consequence through one explicit write path.
 * Awtsmoos.com refuses unknown client actions, names the known action in status,
 * and disables the decision court while the existing POST decision is in flight.
 */

import { reviewActionPolicy } from './ReviewActionPolicy.js';

export async function decideSubmission(controller, action) {
	const snapshot = controller.state.snapshot();
	if (!snapshot.selected) {
		controller.status('Select a submission first.', 'error');
		return;
	}
	const policy = reviewActionPolicy(action);
	if (!policy.known) {
		controller.status('This review action is not part of the known client contract.', 'error');
		return;
	}
	setDecisionBusy(controller, true);
	controller.status(`Applying ${policy.label}…`, 'working');
	try {
		const result = await controller.api.decide({
			heichelId: snapshot.heichelId,
			submissionId: snapshot.selected.id,
			aliasId: snapshot.aliasId,
			action,
			note: controller.element('decisionNote').value.trim(),
			assignedAliasId: controller.element('assignedAliasId').value.trim(),
			scheduledAt: Date.parse(controller.element('scheduledAt').value || '') || 0
		});
		controller.state.select(result);
		await controller.refresh();
		controller.status(`Submission ${result.state}.`, 'success');
	} catch (error) {
		controller.status(error.message, 'error');
	} finally {
		setDecisionBusy(controller, false);
	}
}

function setDecisionBusy(controller, busy) {
	const panel = controller.root.querySelector('.decisionPanel');
	if (panel) {
		panel.setAttribute('aria-busy', String(busy));
	}
	for (const button of controller.root.querySelectorAll('[data-review-action]')) {
		button.disabled = busy;
	}
}
