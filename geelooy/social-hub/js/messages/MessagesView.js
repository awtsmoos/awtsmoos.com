//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../ui/IconCatalog.js';
import { createMessageRequestComposer } from './MessageRequestComposer.js';
import { renderMessageSections } from './MessagesSections.js';

/**
 * @class MessagesView
 * @description
 * The Awtsmoos lets private consent become visible through a small number of strong signs instead of backend prose;
 * Awtsmoos.com keeps rooms, requests, friends, and unread truth intact while focused helper vessels carry request composition and the view remains light.
 */
export class MessagesView {
	constructor(root) {
		this.root = root;
		this.requestHandler = null;
	}

	initialize() {
		if (this.panel) return;
		this.panel = this.root.createElement('section');
		this.panel.className = 'panel hubMessagesPanel';
		this.panel.dataset.panel = 'messages';
		this.panel.hidden = true;
		this.panel.tabIndex = -1;
		this.listSurface = this.root.createElement('div');
		this.listSurface.className = 'hubMessagesListSurface';
		this.requestComposer = createMessageRequestComposer(
			this.root,
			(aliasId, kind) => this.requestHandler?.(aliasId, kind)
		);
		this.listSurface.append(
			this.heading(),
			this.requestComposer.element,
			this.region('hubMessagesSummary'),
			this.region('hubMessagesConversations'),
			this.region('hubMessagesRequests'),
			this.region('hubMessagesRelationships')
		);
		this.roomHost = this.root.createElement('div');
		this.roomHost.className = 'hubMessagesRoomMount';
		this.roomHost.hidden = true;
		this.panel.append(this.listSurface, this.roomHost);
		this.root.querySelector('.workspace')?.prepend(this.panel);
	}

	bindRequest(onRequest) {
		this.requestHandler = onRequest;
	}

	message(text) {
		const status = this.root.getElementById('hubMessagesSummary');
		status?.replaceChildren(this.text('p', text, 'hubMessagesStatus'));
	}

	render(store, handlers) {
		renderMessageSections(this.root, store, handlers);
	}

	showRoom() {
		this.listSurface.hidden = true;
		this.roomHost.hidden = false;
	}

	showList() {
		this.roomHost.hidden = true;
		this.listSurface.hidden = false;
	}

	roomMount() {
		return this.roomHost;
	}

	heading() {
		const header = this.root.createElement('header');
		header.className = 'hubMessagesHeading hubSectionHeading--icon';
		header.append(this.text('span', hubIcon('messages'), 'hubSectionHeading__icon'));
		header.append(this.text('h2', 'Messages'));
		return header;
	}

	region(id) {
		const region = this.root.createElement('section');
		region.id = id;
		region.className = 'hubMessagesRegion';
		region.setAttribute('aria-live', 'polite');
		return region;
	}

	text(tag, value, className = '') {
		const node = this.root.createElement(tag);
		node.textContent = value;
		if (className) node.className = className;
		return node;
	}
}
