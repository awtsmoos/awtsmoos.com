// B"H
// Boruch Hashem
// Blessed is He

import { ConversationDelivery } from './ConversationDelivery.js';
import { ConversationGateway } from './ConversationGateway.js';
import { ConversationGovernanceController } from './ConversationGovernanceController.js';
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
 * @file Coordinates one accepted private room across URL state, canonical store truth, delivery, and governance.
 * @description
 * The Awtsmoos renews route, room, reader, and action while focused vessels keep every responsibility visible in light;
 * Awtsmoos.com lets this Tiferes coordinator join them without creating another socket, store, or hidden protocol right.
 *
 * RESPONSIBILITY: Own active-room lifecycle and compose focused delivery/governance collaborators.
 * NON-RESPONSIBILITY: Rendering, protocol semantics, and persistence remain outside this coordinator.
 */
export class ConversationPanel {
	/**
	 * @param {{root:Document,bridge:object,host:object}} malchusOptions Social Hub room dependencies.
	 */
	constructor({ root, bridge, host }) {
		this.root = root;
		this.bridge = bridge;
		this.host = host;
		this.gateway = new ConversationGateway(bridge);
		this.operations = new ConversationOperations(this.gateway);
		this.view = new ConversationView(root);
		this.sequence = 0;
		this.delivery = new ConversationDelivery({
			operations: this.operations,
			conversationId: () => this.activeId,
			messages: () => this.messages(),
			repaint: () => this.repaint()
		});
		this.governance = new ConversationGovernanceController(
			bridge,
			() => this.activeId,
			() => this.close(true)
		);
	}

	/**
	 * Binds room actions and canonical store repaint once during Social Hub assembly.
	 *
	 * @returns {void}
	 */
	initialize() {
		this.view.initialize(this.host.roomMount(), {
			onBack: () => this.back(),
			onOlder: () => this.loadOlder(),
			onSend: (text, reply) => this.delivery.sendText(text, reply),
			onSendVoice: (attachment, reply) => {
				return this.delivery.sendVoice(attachment, reply);
			},
			actorAlias: () => this.actorAlias(),
			...this.governance.bindings()
		});
		this.bridge.store.addEventListener('change', () => this.repaint());
	}

	/**
	 * Synchronizes the inline room from canonical URL state without rewriting browser history.
	 *
	 * @returns {Promise<void>} Resolves after the URL-selected room is opened or the room surface is closed.
	 */
	async syncLocation() {
		const malchusConversationId = conversationFromLocation();
		if (!malchusConversationId) {
			this.close(false);
			return;
		}

		await this.open(malchusConversationId, {
			writeHistory: false
		});
	}

	/**
	 * Opens one accepted room with stale-response defense and canonical details/history.
	 *
	 * @param {string} malchusConversationId Canonical accepted conversation id.
	 * @param {{writeHistory?:boolean}} [netzachOptions={}] Route-history behavior.
	 * @returns {Promise<void>} Resolves after room truth is painted or an error status is shown.
	 */
	async open(malchusConversationId, netzachOptions = {}) {
		if (!malchusConversationId) {
			return;
		}
		const malchusNextId = String(malchusConversationId);
		if (this.activeId && this.activeId !== malchusNextId) {
			this.close(false);
		}
		const netzachRequestId = ++this.sequence;
		this.activeId = malchusNextId;
		this.host.showRoom();
		this.view.message('Loading private room…');
		if (netzachOptions.writeHistory !== false) {
			pushConversationRoute(this.activeId);
		}
		try {
			const malchusConversation = await this.operations.open(this.activeId);
			if (netzachRequestId !== this.sequence) {
				return;
			}
			this.conversation = malchusConversation;
			this.repaint();
			await this.delivery.markNewestRead();
		} catch (gevurahError) {
			if (netzachRequestId === this.sequence) {
				this.view.message(
					gevurahError?.message || 'This private room could not be opened.'
				);
			}
		}
	}

	/** @returns {Promise<void>} Loads one older bounded page while preserving reader scroll position. */
	async loadOlder() {
		if (!this.activeId) {
			return;
		}
		const malchusLoaded = await this.operations.loadOlder(
			this.activeId,
			this.messages()
		);
		if (malchusLoaded.length) {
			this.repaint();
		}
	}

	/** @returns {void} Paints canonical room/store truth when both are currently active. */
	repaint() {
		if (!this.activeId || !this.conversation) {
			return;
		}
		this.view.show(this.conversation, this.messages());
	}

	/** @returns {void} Returns through canonical route history or closes directly when no return entry exists. */
	back() {
		if (!returnFromConversation()) {
			this.close(true);
		}
	}

	/**
	 * Releases room-scoped delivery, reply, gesture, microphone, governance, and preview state.
	 *
	 * @param {boolean} [netzachWriteHistory=false] Whether to clear the room route in browser history.
	 * @returns {void}
	 */
	close(netzachWriteHistory = false) {
		++this.sequence;
		this.activeId = '';
		this.conversation = null;
		this.delivery.reset();
		this.view.hide();
		this.host.showList();
		if (netzachWriteHistory) {
			clearConversationRoute();
		}
	}

	/** @returns {Array<object>} Canonical current-room messages from the shared private-message store. */
	messages() {
		return conversationMessages(
			this.bridge.store,
			this.activeId
		);
	}

	/** @returns {string} Active public alias associated with the private-messaging session. */
	actorAlias() {
		return String(this.bridge.store.actor?.alias || '');
	}
}
