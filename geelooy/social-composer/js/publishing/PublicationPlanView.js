//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class PublicationPlanView
 * @description
 * Canonical birth, every secondary mirror, policy mode, visibility, scheduling,
 * and server preview become visible before publication. The Awtsmoos knows the
 * entire deed at once; Awtsmoos.com shows the writer what each destination will do.
 */

import {
	buildPublicationPlan,
	publicationIssues
} from './PublicationPlan.js';
import { buildPostPayload } from '../model/PostPayload.js';

function destinationLine(destination, label) {
	return `${label}: ${destination.heichelId || 'unset'} › ${destination.seriesId || 'root'}${destination.kind ? ` · ${destination.kind}` : ''}`;
}

function actionLine(action) {
	const destination = action.destination
		? `${action.destination.heichelId}/${action.destination.seriesId}`
		: 'canonical destination';
	return `${action.type} · ${destination} · ${action.explanation}`;
}

export class PublicationPlanView {
	constructor({ root, state, api, status }) {
		Object.assign(this, { root, state, api, status });
	}

	bind() {
		this.element('previewPlanButton').addEventListener('click', () => this.preview());
		this.element('visibility').addEventListener('change', event => {
			this.state.setPublication('visibility', event.target.value);
		});
		this.element('scheduledAt').addEventListener('change', event => {
			this.state.setPublication('scheduledAt', event.target.value ? Date.parse(event.target.value) : 0);
		});
	}

	render(snapshot) {
		const plan = buildPublicationPlan(snapshot);
		const lines = [
			destinationLine(plan.primary, 'Canonical origin'),
			...plan.secondary.map((item, index) => destinationLine(item, `Secondary ${index + 1}`)),
			`Content kind: ${plan.contentKind}`,
			`Visibility: ${plan.visibility}`,
			plan.scheduledAt ? `Scheduled: ${new Date(plan.scheduledAt).toLocaleString()}` : 'Publish timing: immediate',
			`Idempotency key: ${plan.idempotencyKey}`
		];
		const issues = publicationIssues(snapshot);
		if (issues.length) lines.push(`Needs attention: ${issues.join(' ')}`);
		this.element('publicationPlanView').textContent = lines.join('\n');
		this.element('visibility').value = plan.visibility;
	}

	async preview() {
		const snapshot = this.state.snapshot();
		const issues = publicationIssues(snapshot);
		if (issues.length) {
			this.status.show(issues.join(' '), 'error');
			return null;
		}
		this.status.show('Checking every destination and moderation gate…', 'working');
		try {
			const preview = await this.api.previewPublication(
				buildPostPayload(snapshot),
				buildPublicationPlan(snapshot)
			);
			this.state.setPublication('lastPreview', preview);
			this.element('publicationPlanResult').textContent = [
				actionLine(preview.primary),
				...preview.secondary.map(actionLine),
				preview.requiresReview ? 'Result: moderator review required.' : 'Result: direct publication available.'
			].join('\n');
			this.status.show('Publication plan verified by the server.', 'success');
			return preview;
		} catch (error) {
			this.element('publicationPlanResult').textContent = error.message;
			this.status.show(error.message, 'error');
			return null;
		}
	}

	element(id) {
		return this.root.getElementById(id);
	}
}

export {
	destinationLine,
	actionLine
};
