//B"H
//Boruch Hashem
//Blessed is He

import { filteredItems, timelineWindow } from '../filters/TimelineFilter.js';

/**
 * @class TimelineView
 * @description
 * The Awtsmoos lets a vast history appear through a bounded window instead of flooding the DOM;
 * Awtsmoos.com renders imported words only as text and reveals more memories by deliberate calm.
 */
export class TimelineView {
	constructor({ root = document, store }) {
		this.root = root;
		this.store = store;
		this.list = root.getElementById('migrationTimeline');
		this.more = root.getElementById('loadMoreMemories');
		this.limit = 80;
		this.more.addEventListener('click', () => {
			this.limit += 80;
			this.render(this.store.snapshot());
		});
	}

	render(state) {
		const filtered = filteredItems(state.items, state.filters, state.selectedIds);
		const visible = timelineWindow(filtered, 0, this.limit);
		this.list.replaceChildren(...visible.map(item => this.card(item, state.selectedIds)));
		this.more.hidden = visible.length >= filtered.length;
		this.more.textContent = `Show more · ${visible.length}/${filtered.length}`;
	}

	card(item, selectedIds) {
		const card = document.createElement('article');
		card.className = 'memoryCard';
		card.dataset.provider = item.provider;
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = selectedIds.has(item.id);
		checkbox.setAttribute('aria-label', `Select ${item.title || 'memory'}`);
		checkbox.addEventListener('change', () => this.store.toggle(item.id, checkbox.checked));
		const body = document.createElement('div');
		body.className = 'memoryBody';
		body.append(this.meta(item), this.title(item), this.excerpt(item), this.mediaButton(item));
		card.append(checkbox, body);
		return card;
	}

	meta(item) {
		const row = document.createElement('div');
		row.className = 'memoryMeta';
		const date = item.publishedAt
			? new Date(item.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
			: 'Unknown date';
		row.textContent = `${item.provider} · ${item.sourceType} · ${date}`;
		return row;
	}

	title(item) {
		const heading = document.createElement('h3');
		heading.textContent = item.title || 'Untitled memory';
		return heading;
	}

	excerpt(item) {
		const paragraph = document.createElement('p');
		paragraph.textContent = String(item.content || '').slice(0, 360);
		return paragraph;
	}

	mediaButton(item) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'quietButton';
		button.textContent = item.mediaPaths.length
			? `Preview media · ${item.mediaPaths.length}`
			: 'No local media';
		button.disabled = !item.mediaPaths.length;
		button.addEventListener('click', () => {
			this.root.dispatchEvent(new CustomEvent('migration:preview', { detail: { item } }));
		});
		return button;
	}
}
