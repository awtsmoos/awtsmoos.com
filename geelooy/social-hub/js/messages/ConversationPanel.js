//B"H
//Boruch Hashem
//Blessed is He

import { ConversationDelivery } from './ConversationDelivery.js';
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

/**
 * @class ConversationPanel
 * @description
 * The Awtsmoos renews room, route, bounded history, and visible reader while Awtsmoos.com lets delivery and read-watermark motion flow through a separate Netzach vessel;
 * this Tiferes-like coordinator owns open, close, route synchronization, and store repaint only, creating no second socket, store, or shadow light.
 */
export class ConversationPanel {
	constructor({ root, bridge, host }) {
		Object.assign(this, { root, bridge, host });
		this.operations = new ConversationOperations(new ConversationGateway(bridge));
		this.view = new ConversationView(root);
		this.sequence = 0;
		this.delivery = new ConversationDelivery({
			operations: this.operations,
			conversationId: () => this.activeId,
			messages: () => this.messages(),
			repaint: () => this.repaint()
		});
	}

	/** Binds canonical room operations and store repaint once. */
	initialize() {
		this.view.initialize(this.host.roomMount(), {
			onBack: () => this.back(),
			onOlder: () => void this.loadOlder(),
			onSend: (text, reply) => this.delivery.sendText(text, reply),
			onSendVoice: (attachment, reply) => this.delivery.sendVoice(attachment, reply),
			actorAlias: () => this.actorAlias()
		});
		this.bridge.store.addEventListener('change', () => this.repaint());
	}

	/** Synchronizes the inline room from canonical URL state without rewriting history. */
	async syncLocation() {
		const conversationId = conversationFromLocation();
		if (!conversationId) {
			this.close(false);
			return;
		}
		await this.open(conversationId, { writeHistory: false });
	}

	/** Opens one accepted room with stale-response defense and canonical details/history. */
	async open(conversationId, options = {}) {
		if (!conversationId) return;
		const nextId = String(conversationId);
		if (this.activeId && this.activeId !== nextId) this.close(false);
		const requestId = ++this.sequence;
		this.activeId = nextId;
		this.host.showRoom();
		this.view.message('Loading private room…');
		if (options.writeHistory !== false) pushConversationRoute(this.activeId);
		try {
			const conversation = await this.operations.open(this.activeId);
			if (requestId !== this.sequence) return;
			this.conversation = conversation;
			this.repaint();
			await this.delivery.markNewestRead();
		} catch (error) {
			if (requestId === this.sequence) {
				this.view.message(error?.message || 'This private room could not be opened.');
			}
		}
	}

	/** Loads one older bounded page while ConversationView preserves reader scroll position. */
	async loadOlder() {
		if (!this.activeId) return;
		const loaded = await this.operations.loadOlder(this.activeId, this.messages());
		if (loaded.length) this.repaint();
	}

	repaint() {
		if (!this.activeId || !this.conversation) return;
		this.view.show(this.conversation, this.messages());
	}

	back() {
		if (!returnFromConversation()) this.close(true);
	}

	/** Closes the room and releases every room-scoped delivery, reply, gesture, microphone, and preview resource. */
	close(writeHistory = false) {
		++this.sequence;
		this.activeId = '';
		this.conversation = null;
		this.delivery.reset();
		this.view.hide();
		this.host.showList();
		if (writeHistory) clearConversationRoute();
	}

	messages() {
		return conversationMessages(this.bridge.store, this.activeId);
	}

	actorAlias() {
		return String(this.bridge.store.actor?.alias || '');
	}
}
