//B"H
//Boruch Hashem
//Blessed is He

import { inboxItemCard } from './InboxItemCard.js';
import { InboxStateView } from './InboxStateView.js';

/**
 * @class InboxView
 * @description
 * The Awtsmoos lets Mail, Signals, and bridge threads gather without erasing one another, while Awtsmoos.com gives summary, status, thread context, and records separate visible vessels;
 * this Tiferes-like view owns DOM composition only, so network timing and canonical read state remain outside its finite light.
 */
export class InboxView {
	constructor(root) {
		this.root = root;
		this.stateView = new InboxStateView(root);
	}

	/** Creates the dynamic Inbox panel once and preserves canonical route-panel semantics. */
	ensurePanel() {
		if (this.panel) return this.panel;
		this.panel = this.root.createElement('section');
		this.panel.className = 'panel communicationsInboxPanel';
		this.panel.dataset.panel = 'inbox';
		this.panel.hidden = true;
		this.panel.tabIndex = -1;
		this.panel.append(
			this.heading(),
			this.region('communicationsInboxState', true),
			this.region('communicationsSummary'),
			this.region('communicationsThreadHeader', true),
			this.region('communicationsItems')
		);
		this.root.querySelector('.workspace')?.prepend(this.panel);
		return this.panel;
	}

	/** Creates the human-facing Inbox heading without mixing live state into static copy. */
	heading() {
		const header = this.root.createElement('header');
		header.className = 'communicationsInboxHeading';
		const title = this.root.createElement('h2');
		title.textContent = 'Inbox';
		const copy = this.root.createElement('p');
		copy.textContent = 'Mail, Signals, bridge threads, and social attention in one truthful place.';
		header.append(title, copy);
		return header;
	}

	/** Creates one stable dynamic region with optional initial hiding. */
	region(id, hidden = false) {
		const region = this.root.createElement('div');
		region.id = id;
		region.className = 'communicationsInboxRegion';
		region.hidden = hidden;
		region.setAttribute('aria-live', 'polite');
		return region;
	}

	/** Renders canonical unread counts for the three communication rivers. */
	summary(overview = {}) {
		const region = this.root.getElementById('communicationsSummary');
		region?.replaceChildren(
			this.summaryCard('Bridge inbox', overview.inbox?.unread || 0, '#inbox'),
			this.summaryCard('Signals', overview.notifications?.unread || 0, '/notifications/'),
			this.summaryCard('Mail', overview.mail?.unread || 0, '/email/')
		);
	}

	/** Creates one summary link that keeps the unread number visually primary. */
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

	/** Renders a stable record collection or a truthful calm empty state. */
	items(items, onOpen, onRead) {
		const region = this.root.getElementById('communicationsItems');
		if (!region) return;
		if (!items.length) {
			const empty = this.root.createElement('p');
			empty.className = 'communicationsInboxMessage';
			empty.textContent = 'Nothing needs your attention here right now.';
			region.replaceChildren(empty);
			return;
		}
		region.replaceChildren(...items.map(item => {
			return inboxItemCard(this.root, item, onOpen, onRead);
		}));
	}

	/** Reveals explicit bridge-thread context around the current collection. */
	thread(threadId, onBack) {
		this.stateView.thread(threadId, onBack);
	}

	/** Restores overview mode without touching cached list or network state. */
	overview() {
		this.stateView.overview();
	}
}
