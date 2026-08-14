//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class InboxView
 * @description
 * The Awtsmoos lets Mail, Signals, and bridge threads appear as one attention plaza without merging their source rivers;
 * Awtsmoos.com keeps summary, empty state, and collection rendering here while each bridge record lives in its own smaller vessel.
 */
import { inboxItemCard } from './InboxItemCard.js';

export class InboxView {
	constructor(root) {
		this.root = root;
	}

	ensurePanel() {
		if (this.panel) return this.panel;
		this.panel = this.root.createElement('section');
		this.panel.className = 'panel communicationsInboxPanel';
		this.panel.dataset.panel = 'inbox';
		this.panel.hidden = true;
		this.panel.tabIndex = -1;
		this.panel.append(
			this.heading(),
			this.region('communicationsSummary'),
			this.region('communicationsItems')
		);
		this.root.querySelector('.workspace')?.prepend(this.panel);
		return this.panel;
	}

	heading() {
		const header = this.root.createElement('header');
		header.className = 'communicationsInboxHeading';
		const title = this.root.createElement('h2');
		title.textContent = 'Inbox';
		const copy = this.root.createElement('p');
		copy.textContent = 'Mail, Signals, live thread pointers, and social attention in one truthful place.';
		header.append(title, copy);
		return header;
	}

	region(id) {
		const region = this.root.createElement('div');
		region.id = id;
		region.className = 'communicationsInboxRegion';
		region.setAttribute('aria-live', 'polite');
		return region;
	}

	message(text) {
		const paragraph = this.root.createElement('p');
		paragraph.className = 'communicationsInboxMessage';
		paragraph.textContent = text;
		this.root.getElementById('communicationsItems')?.replaceChildren(paragraph);
	}

	summary(overview = {}) {
		const region = this.root.getElementById('communicationsSummary');
		region?.replaceChildren(
			this.summaryCard('Bridge inbox', overview.inbox?.unread || 0, '#inbox'),
			this.summaryCard('Signals', overview.notifications?.unread || 0, '/notifications/'),
			this.summaryCard('Mail', overview.mail?.unread || 0, '/email/')
		);
	}

	summaryCard(label, count, href) {
		const link = this.root.createElement('a');
		link.className = 'communicationsSummaryCard';
		link.href = href;
		const strong = this.root.createElement('strong');
		strong.textContent = String(count);
		const span = this.root.createElement('span');
		span.textContent = label;
		link.append(strong, span);
		return link;
	}

	items(items, onOpen, onRead) {
		const region = this.root.getElementById('communicationsItems');
		if (!items.length) {
			this.message('Inbox clear. New bridge records will appear here without replacing Mail or Signals.');
			return;
		}
		const cards = items.map(item => {
			return inboxItemCard(this.root, item, onOpen, onRead);
		});
		region?.replaceChildren(...cards);
	}
}
