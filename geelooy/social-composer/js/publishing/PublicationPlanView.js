//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PublicationPlanView
 * @description
 * The Awtsmoos knows every destination in one timeless unity; Awtsmoos.com reveals canonical birth,
 * secondary mirrors, public audience truth, timing, moderation, and server verification before the deed appears.
 */
import { buildPostPayload } from '../model/PostPayload.js';
import { buildPublicationPlan, publicationIssues } from './PublicationPlan.js';

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
		this.element('previewPlanButton')?.addEventListener('click', () => this.preview());
		this.element('scheduledAt')?.addEventListener('change', event => {
			this.state.setPublication('scheduledAt', event.target.value ? Date.parse(event.target.value) : 0);
		});
		const visibility = this.element('visibility');
		if (visibility) {
			visibility.value = 'public';
			visibility.disabled = true;
		}
	}

	render(snapshot) {
		const plan = buildPublicationPlan(snapshot);
		const lines = [
			destinationLine(plan.primary, 'Canonical origin'),
			...plan.secondary.map((destination, index) => destinationLine(destination, `Secondary ${index + 1}`)),
			`Content kind: ${plan.contentKind}`,
			'Audience: Public social post',
			plan.scheduledAt ? `Scheduled: ${new Date(plan.scheduledAt).toLocaleString()}` : 'Publish timing: immediate',
			`Idempotency key: ${plan.idempotencyKey}`
		];
		const issues = publicationIssues(snapshot);
		if (issues.length) lines.push(`Needs attention: ${issues.join(' ')}`);
		const view = this.element('publicationPlanView');
		if (view) view.textContent = lines.join('\n');
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
			const preview = await this.api.previewPublication(buildPostPayload(snapshot), buildPublicationPlan(snapshot));
			this.state.setPublication('lastPreview', preview);
			const result = this.element('publicationPlanResult');
			if (result) {
				result.textContent = [
					actionLine(preview.primary),
					...preview.secondary.map(actionLine),
					preview.requiresReview ? 'Result: moderator review required.' : 'Result: direct publication available.'
				].join('\n');
			}
			this.status.show('Publication plan verified by the server.', 'success');
			return preview;
		} catch (error) {
			const result = this.element('publicationPlanResult');
			if (result) result.textContent = error.message;
			this.status.show(error.message, 'error');
			return null;
		}
	}

	element(id) {
		return this.root?.getElementById?.(id) || null;
	}
}

export { actionLine, destinationLine };
