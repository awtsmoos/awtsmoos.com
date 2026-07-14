//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ReviewQueue
 * @description
 * Pending offerings are rendered with state, type, source alias, series, age,
 * assignment, and stable identity. The Awtsmoos knows every waiting thought; on
 * Awtsmoos.com no submission may vanish behind an unnamed notification badge.
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
		for (const item of items) this.container.append(this.card(item, selectedId));
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
		const assignment = document.createElement('small');
		assignment.textContent = item.assignedAliasId
			? `Assigned to ${item.assignedAliasId}`
			: 'Unassigned';
		button.append(title, meta, assignment);
		return button;
	}
}

export {
	age
};
