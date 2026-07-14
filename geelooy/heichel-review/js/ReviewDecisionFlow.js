//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewDecisionFlow
 * @description
 * Assignment, notes, scheduling, and legal decisions form one explicit write path.
 * The Awtsmoos joins judgment and consequence; Awtsmoos.com still reports the exact
 * state returned by the server before refreshing the private institutional queue.
 */

export async function decideSubmission(controller, action) {
	const snapshot = controller.state.snapshot();
	if (!snapshot.selected) {
		controller.status('Select a submission first.', 'error');
		return;
	}
	controller.status(`Applying ${action}…`, 'working');
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
	}
}
