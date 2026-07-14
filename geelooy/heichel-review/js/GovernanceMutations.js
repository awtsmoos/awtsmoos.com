//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GovernanceMutations
 * @description
 * Role changes, consent-bearing invitations, responses, and bounded series policy
 * writes share one refresh-after-mutation discipline. The Awtsmoos gives every deed
 * its truth while Awtsmoos.com refuses optimistic authority before server revalidation.
 */

export class GovernanceMutations {
	constructor(panel) {
		this.panel = panel;
	}

	changeRole({ memberAliasId, role, reason }) {
		const snapshot = this.panel.reviewState.snapshot();
		return this.perform('Applying hierarchy-safe role change…', () => {
			return this.panel.api.setMemberRole({
				heichelId: snapshot.heichelId,
				actorAliasId: snapshot.aliasId,
				memberAliasId,
				role,
				reason
			});
		});
	}

	invite() {
		const snapshot = this.panel.reviewState.snapshot();
		return this.perform('Creating consent-bearing role invitation…', () => {
			return this.panel.api.invite({
				heichelId: snapshot.heichelId,
				actorAliasId: snapshot.aliasId,
				memberAliasId: this.panel.element('inviteAliasId').value.trim(),
				role: this.panel.element('inviteRole').value,
				reason: this.panel.element('inviteReason').value.trim()
			});
		});
	}

	respond(invitationId, response) {
		const snapshot = this.panel.reviewState.snapshot();
		return this.perform(`Recording invitation ${response}…`, () => {
			return this.panel.api.respond({
				heichelId: snapshot.heichelId,
				actorAliasId: snapshot.aliasId,
				invitationId,
				response
			});
		});
	}

	savePolicy() {
		const snapshot = this.panel.reviewState.snapshot();
		return this.perform('Saving bounded series policy…', () => {
			return this.panel.api.updateSeriesPolicy({
				heichelId: snapshot.heichelId,
				seriesId: this.panel.element('policySeriesId').value.trim() || 'root',
				actorAliasId: snapshot.aliasId,
				policy: this.policyValue()
			});
		});
	}

	policyValue() {
		return {
			allowContentSubmissions: this.checked('policyAllowContent'),
			requireContentApproval: this.checked('policyRequireContentApproval'),
			allowReferenceSubmissions: this.checked('policyAllowReferences'),
			requireReferenceApproval: this.checked('policyRequireReferenceApproval'),
			commentsEnabled: this.checked('policyCommentsEnabled'),
			answersEnabled: this.checked('policyAnswersEnabled')
		};
	}

	checked(id) {
		return this.panel.element(id).checked;
	}

	async perform(message, action) {
		this.panel.status(message, 'working');
		try {
			await action();
			await this.panel.load(false);
			this.panel.status('Governance change saved and reverified.', 'success');
		} catch (error) {
			this.panel.status(error.message, 'error');
		}
	}
}
