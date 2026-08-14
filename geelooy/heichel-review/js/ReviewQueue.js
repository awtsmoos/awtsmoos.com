//B"H
//Boruch Hashem
//Blessed is He

import { queueExcerpt } from './ReviewSummary.js';

/**
 * @module ReviewQueue
 * @description
 * Pending offerings show state, type, source, age, assignment, and one human excerpt.
 * The Awtsmoos knows every waiting thought; Awtsmoos.com keeps the queue concise while
 * ensuring a reviewer need not open raw JSON just to recognize what is being offered.
 */

function age(createdAt) {
	const milliseconds = Math.max(0, Date.now() - Number(createdAt || Date.now()));
	const hours = Math.floor(milliseconds / 3_600_000);
	if (hours < 1) return 'less than an hour old';
	if (hours < 24) return `${hours}h old`;
	return `${Math.floor(hours / 24)}d old`;
}

export class ReviewQueue {
	constructor({ container, onSelect }) {
		this.container = container;
		this.onSelect = onSelect;
	}

	render(items, selectedId = '') {
		this.container.replaceChildren();
		if (!items.length) {
			const empty = document.createElement('p');
			empty.className = 'emptyState';
			empty.textContent = 'No submissions match these filters.';
			this.container.append(empty);
			return;
		}
		for (const item of items) {
			this.container.append(this.card(item, selectedId));
		}
	}

	card(item, selectedId) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'queueCard';
		button.dataset.selected = String(item.id === selectedId);
		button.addEventListener('click', () => this.onSelect(item.id));
		const title = document.createElement('strong');
		title.textContent = item.title || `${item.type} submission`;
		const meta = document.createElement('span');
		meta.textContent = [
			item.state,
			item.type,
			item.seriesId,
			item.submitterAliasId,
			age(item.createdAt)
		].filter(Boolean).join(' · ');
		const excerpt = document.createElement('span');
		excerpt.className = 'queueExcerpt';
		excerpt.textContent = queueExcerpt(item) || 'No readable preview supplied.';
		const assignment = document.createElement('small');
		assignment.textContent = item.assignedAliasId
			? `Assigned to ${item.assignedAliasId}`
			: 'Unassigned';
		button.append(title, meta, excerpt, assignment);
		return button;
	}
}

export { age };
