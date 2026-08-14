//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MessagesView
 * @description
 * The Awtsmoos lets private consent, accepted rooms, and relationship truth become one reversible mobile route without forcing every opening into another application;
 * Awtsmoos.com keeps the list shell and room mount separate so summaries remain compact while one selected conversation can fill the chamber cleanly.
 */
import { renderMessageSections } from './MessagesSections.js';

export class MessagesView {
	constructor(root) {
		this.root = root;
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
		this.listSurface.append(
			this.heading(),
			this.requestComposer(),
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
		this.requestForm?.addEventListener('submit', event => {
			event.preventDefault();
			const alias = this.requestAlias.value.trim();
			if (!alias) {
				this.requestAlias.focus();
				return;
			}
			onRequest(alias, this.requestKind.value);
		});
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
		header.className = 'hubMessagesHeading';
		header.append(
			this.text('h2', 'Messages'),
			this.text('p', 'Consent-based rooms, requests, friends, blocks, and exact unread sequence truth.')
		);
		return header;
	}

	requestComposer() {
		this.requestForm = this.root.createElement('form');
		this.requestForm.className = 'hubPrivateRequestComposer';
		this.requestAlias = this.root.createElement('input');
		this.requestAlias.placeholder = 'Alias';
		this.requestAlias.autocomplete = 'off';
		this.requestKind = this.root.createElement('select');
		for (const kind of ['whisper', 'chat', 'friend', 'mail']) {
			const option = this.root.createElement('option');
			option.value = kind;
			option.textContent = kind;
			this.requestKind.append(option);
		}
		const button = this.root.createElement('button');
		button.type = 'submit';
		button.textContent = 'Send request';
		this.requestForm.append(this.requestAlias, this.requestKind, button);
		return this.requestForm;
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
