//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MessagesPanel
 * @description
 * The Awtsmoos lets Social Hub witness accepted rooms, consent requests, relationships, and one inline private conversation without owning their authorization or transport;
 * Awtsmoos.com keeps the existing bridge/session/store canonical while list refresh, room drilldown, request resolution, and browser restoration share one mobile route.
 */
import { mountPrivateMessagingBridge } from '/scripts/awtsmoos/social/privateMessaging/bootstrap.js';
import { REQUEST_RESOLVE } from '/scripts/awtsmoos/social/privateMessaging/protocol.js';
import { ConversationPanel } from './ConversationPanel.js';
import { MessagesView } from './MessagesView.js';

export class MessagesPanel {
	constructor(root) {
		this.root = root;
		this.view = new MessagesView(root);
		this.bridge = null;
		this.loading = null;
	}

	initialize() {
		this.view.initialize();
		this.view.bindRequest((alias, kind) => void this.request(alias, kind));
		this.bridge = mountPrivateMessagingBridge();
		this.conversation = new ConversationPanel({
			root: this.root,
			bridge: this.bridge,
			host: this.view
		});
		this.conversation.initialize();
		this.bridge.store.addEventListener('change', () => this.render());
	}

	async load() {
		if (this.loading) return this.loading;
		this.loading = this.refresh();
		try {
			await this.loading;
			await this.conversation.syncLocation();
		} finally {
			this.loading = null;
		}
	}

	async refresh() {
		this.view.message('Opening verified private messaging…');
		try {
			const opened = await this.bridge.session.start();
			if (!opened) {
				this.view.message('Choose a verified alias to open private messaging.');
				return;
			}
			await Promise.all([
				this.bridge.session.refreshConversations(),
				this.bridge.session.refreshRequests(),
				this.bridge.session.refreshRelationships()
			]);
			this.render();
		} catch (error) {
			this.view.message(error?.message || 'Private messaging could not be opened.');
		}
	}

	render() {
		if (!this.bridge?.session.opened) return;
		this.view.render(this.bridge.store, {
			onOpen: conversation => void this.conversation.open(conversation.id),
			onResolve: (requestId, resolution) => void this.resolve(requestId, resolution)
		});
	}

	async request(alias, kind) {
		this.view.message(`Sending ${kind} request to @${alias}…`);
		try {
			await this.bridge.request(alias, kind);
			await this.bridge.session.refreshRequests();
			this.render();
		} catch (error) {
			this.view.message(error?.message || 'Private request could not be sent.');
		}
	}

	async resolve(requestId, resolution) {
		this.view.message(`${resolution === 'accepted' ? 'Accepting' : 'Declining'} request…`);
		try {
			await this.bridge.socket.request(REQUEST_RESOLVE, { requestId, resolution });
			await Promise.all([
				this.bridge.session.refreshRequests(),
				this.bridge.session.refreshConversations(),
				this.bridge.session.refreshRelationships()
			]);
			this.render();
		} catch (error) {
			this.view.message(error?.message || 'Request could not be changed.');
		}
	}
}
