//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ReviewQueueView
 * @description
 * The Awtsmoos lets accountable review become visible without exposing power to those who do not carry it;
 * Awtsmoos.com renders state, submitter, note, assignment, scheduling, and permitted decisions as one honest moderator surface.
 */
import { actionsForState } from './ReviewActions.js';

export class ReviewQueueView {
	constructor(root) {
		this.root = root;
	}

	message(text) {
		const region = this.root.getElementById('spaceReview');
		const paragraph = this.root.createElement('p');
		paragraph.className = 'spaceReviewMessage';
		paragraph.textContent = text;
		region?.replaceChildren(paragraph);
	}

	render(items, onDecision) {
		const region = this.root.getElementById('spaceReview');
		if (!items.length) {
			this.message('Review queue clear. No submissions need attention in this channel.');
			return;
		}
		const heading = this.root.createElement('header');
		heading.className = 'spaceReviewHeading';
		heading.append(this.text('h4', 'Moderator review'), this.text('small', `${items.length} waiting`));
		region?.replaceChildren(heading, ...items.map(item => this.card(item, onDecision)));
	}

	card(item, onDecision) {
		const card = this.root.createElement('article');
		card.className = 'spaceReviewCard';
		const note = this.field('textarea', 'Decision note');
		note.rows = 2;
		const extra = this.field('input', '');
		extra.className = 'spaceReviewExtra';
		extra.hidden = true;
		const actions = this.root.createElement('div');
		actions.className = 'spaceReviewActions';
		for (const action of actionsForState(item.state)) {
			actions.append(this.actionButton(item, action, note, extra, onDecision));
		}
		card.append(
			this.text('h5', item.title || item.id || 'Untitled submission'),
			this.text('p', this.meta(item), 'spaceReviewMeta'),
			note,
			extra,
			actions
		);
		return card;
	}

	actionButton(item, action, note, extra, onDecision) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.textContent = action.label;
		button.dataset.action = action.id;
		button.addEventListener('click', () => {
			if (!this.extraReady(action.id, extra)) {
				this.configureExtra(action.id, extra);
				return;
			}
			onDecision(item, action.id, {
				note: note.value,
				assignedAliasId: action.id === 'assign' ? extra.value : '',
				scheduledAt: action.id === 'schedule' ? extra.value : ''
			});
		});
		return button;
	}

	extraReady(action, input) {
		if (!['assign', 'schedule'].includes(action)) {
			return true;
		}
		return input.dataset.action === action && Boolean(input.value);
	}

	configureExtra(action, input) {
		input.hidden = false;
		input.dataset.action = action;
		input.value = '';
		input.type = action === 'schedule' ? 'datetime-local' : 'text';
		input.placeholder = action === 'schedule' ? 'Publication time' : 'Reviewer alias';
		input.focus();
	}

	field(tag, placeholder) {
		const element = this.root.createElement(tag);
		element.placeholder = placeholder;
		return element;
	}

	text(tag, value, className = '') {
		const element = this.root.createElement(tag);
		element.textContent = value;
		if (className) element.className = className;
		return element;
	}

	meta(item) {
		return `${item.state || 'submitted'} · ${item.type || 'canonical'} · @${item.submitterAliasId || 'unknown'}`;
	}
}
