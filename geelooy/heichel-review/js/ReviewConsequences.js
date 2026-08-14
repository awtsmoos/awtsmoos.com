//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReviewConsequences
 * @description
 * The Awtsmoos lets judgment become visible before it becomes action. Awtsmoos.com
 * binds legal action metadata to the existing buttons and delegates DOM mechanics to
 * a separate surface vessel so consequence remains focused, small, and auditable.
 */

import { reviewActionPolicy } from './ReviewActionPolicy.js';
import {
	ensureConsequenceSurface,
	setDecisionFieldVisibility
} from './ReviewConsequenceSurface.js';

export class ReviewConsequences {
	constructor(root) {
		this.root = root;
		this.submission = null;
		this.elements = ensureConsequenceSurface(root);
		this.handlePreview = this.handlePreview.bind(this);
		this.bindActions();
	}

	bindActions() {
		for (const button of this.actionButtons()) {
			button.addEventListener('focus', this.handlePreview);
			button.addEventListener('pointerenter', this.handlePreview);
			button.setAttribute('aria-describedby', 'reviewConsequenceText');
		}
	}

	render(submission, allowedActions) {
		this.submission = submission;
		this.annotateButtons(allowedActions);
		this.toggleContextualFields(allowedActions);
		this.renderDefault(allowedActions);
	}

	annotateButtons(allowedActions) {
		const allowed = new Set(allowedActions);
		for (const button of this.actionButtons()) {
			const action = button.dataset.reviewAction;
			const policy = reviewActionPolicy(action);
			button.dataset.reviewKind = policy.kind;
			button.dataset.reviewLegal = String(allowed.has(action));
			button.title = policy.consequence;
		}
	}

	toggleContextualFields(allowedActions) {
		setDecisionFieldVisibility(
			this.root,
			'assignedAliasId',
			allowedActions.includes('assign')
		);
		setDecisionFieldVisibility(
			this.root,
			'scheduledAt',
			allowedActions.includes('schedule')
		);
	}

	renderDefault(allowedActions) {
		const count = allowedActions.length;
		this.elements.section.dataset.kind = 'neutral';
		this.elements.title.textContent = count
			? `${count} legal next ${count === 1 ? 'action' : 'actions'}`
			: 'No legal action available';
		this.elements.text.textContent = count
			? 'Focus or hover an available decision to preview its consequence before activation.'
			: 'The current identity and submission state expose no decision in the existing review matrix.';
		this.elements.meta.textContent = `Current state: ${this.submission?.state || 'unavailable'}`;
	}

	handlePreview(event) {
		const button = event.currentTarget;
		if (!button.hidden) {
			this.preview(button.dataset.reviewAction);
		}
	}

	preview(action) {
		const policy = reviewActionPolicy(action);
		this.elements.section.dataset.kind = policy.kind;
		this.elements.title.textContent = policy.label;
		this.elements.text.textContent = policy.consequence;
		this.elements.meta.textContent = `Current state: ${this.submission?.state || 'unavailable'} · ${policy.kind}`;
	}

	actionButtons() {
		return this.root.querySelectorAll('[data-review-action]');
	}
}
