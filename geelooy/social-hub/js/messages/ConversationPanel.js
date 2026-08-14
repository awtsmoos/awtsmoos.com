//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ConversationPanel
 * @description
 * The Awtsmoos lets one accepted private room become an inline mobile chamber while protocol and browser navigation remain separate vessels;
 * Awtsmoos.com keeps stale-response defense, visibility, and live repaint here without creating another message store, route store, or socket.
 */
import { ConversationGateway } from './ConversationGateway.js';
import { conversationMessages } from './ConversationHistory.js';
import {
	clearConversationRoute,
	pushConversationRoute,
	returnFromConversation
} from './ConversationNavigation.js';
import { ConversationOperations } from './ConversationOperations.js';
import { conversationFromLocation } from './MessageRouteState.js';
import { ConversationView } from './ConversationView.js';

export class ConversationPanel {
	constructor({ root, bridge, host }) {
		Object.assign(this, { root, bridge, host });
		this.operations = new ConversationOperations(new ConversationGateway(bridge));
		this.view = new ConversationView(root);
		this.sequence = 0;
		this.lastRead = 0;
	}

	initialize() {
		this.view.initialize(this.host.roomMount(), {
			onBack: () => this.back(),
			onOlder: () => void this.loadOlder(),
			onSend: text => this.send(text)
		});
		this.bridge.store.addEventListener('change', () => this.repaint());
	}

	async syncLocation() {
		const conversationId = conversationFromLocation();
		if (!conversationId) {
			this.close(false);
			return;
		}
		await this.open(conversationId, { writeHistory: false });
	}

	async open(conversationId, options = {}) {
		if (!conversationId) return;
		const requestId = ++this.sequence;
		this.activeId = String(conversationId);
		this.host.showRoom();
		this.view.message('Loading private room…');
		if (options.writeHistory !== false) pushConversationRoute(this.activeId);
		try {
			const conversation = await this.operations.open(this.activeId);
			if (requestId !== this.sequence) return;
			this.conversation = conversation;
			this.repaint();
			await this.markNewestRead();
		} catch (error) {
			if (requestId === this.sequence) {
				this.view.message(error?.message || 'This private room could not be opened.');
			}
		}
	}

	async loadOlder() {
		if (await this.operations.loadOlder(this.activeId, this.messages())) {
			this.repaint();
		}
	}

	async send(text) {
		if (!this.activeId) return;
		await this.operations.send(this.activeId, text);
		this.repaint();
		await this.markNewestRead();
	}

	async markNewestRead() {
		this.lastRead = await this.operations.markNewestRead(
			this.activeId,
			this.messages(),
			this.lastRead
		);
	}

	repaint() {
		if (!this.activeId || !this.conversation) return;
		this.view.show(this.conversation, this.messages());
	}

	back() {
		if (!returnFromConversation()) this.close(true);
	}

	close(writeHistory = false) {
		++this.sequence;
		this.activeId = '';
		this.conversation = null;
		this.lastRead = 0;
		this.view.hide();
		this.host.showList();
		if (writeHistory) clearConversationRoute();
	}

	messages() {
		return conversationMessages(this.bridge.store, this.activeId);
	}
}
