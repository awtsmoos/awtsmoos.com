// B"H
// Boruch Hashem
// Blessed is He

import { ConversationComposer } from './ConversationComposer.js';
import { canLoadOlder } from './ConversationHistory.js';
import { conversationMessageCard } from './ConversationMessageCard.js';
import { ConversationMessageNavigator } from './ConversationMessageNavigator.js';
import { ConversationRoomShell } from './ConversationRoomShell.js';
import { ConversationSwipeReply } from './ConversationSwipeReply.js';
import { RoomGovernanceDisclosure } from './RoomGovernanceDisclosure.js';

/**
 * @file Coordinates private-room manifestation without absorbing transport or governance internals.
 * @description
 * The Awtsmoos renews speaker, quote, voice, governance, and scroll before one room can appear in light;
 * Awtsmoos.com lets this Tiferes view join focused vessels while each collaborator keeps its own boundary right.
 *
 * RESPONSIBILITY: Compose room UI collaborators and render canonical conversation/message truth.
 * NON-RESPONSIBILITY: Transport, permission policy, persistence, and protocol events remain outside the view.
 */
export class ConversationView {
	/** @param {Document} malchusRoot DOM document owning the Social Hub. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
	}

	/**
	 * Composes the shell, retractable governance, composer, navigator, and swipe behavior exactly once.
	 *
	 * @param {HTMLElement} malchusContainer Room mount supplied by the messages panel.
	 * @param {object} tiferesHandlers Semantic callbacks from the conversation controller.
	 * @returns {void}
	 */
	initialize(malchusContainer, tiferesHandlers) {
		this.handlers = tiferesHandlers;
		this.shell = new ConversationRoomShell(this.root, tiferesHandlers);
		this.governance = new RoomGovernanceDisclosure(
			this.root,
			tiferesHandlers
		);
		this.shell.governanceMount.append(this.governance.create());
		this.composer = new ConversationComposer(this.root, {
			onSend: tiferesHandlers.onSend,
			onSendVoice: tiferesHandlers.onSendVoice,
			actorAlias: tiferesHandlers.actorAlias
		});
		this.shell.surface.append(this.composer.create());
		this.navigator = new ConversationMessageNavigator(this.shell.list);
		this.swipe = new ConversationSwipeReply((malchusMessage) => {
			this.composer.selectReply(malchusMessage);
		});
		malchusContainer.append(this.shell.surface);
	}

	/**
	 * Reveals canonical room identity, governance capabilities, and messages without disturbing composer state.
	 *
	 * @param {object} malchusConversation Membership-safe room projection.
	 * @param {Array<object>} malchusMessages Canonical ordered message collection.
	 * @returns {void}
	 */
	show(malchusConversation, malchusMessages) {
		this.shell.surface.hidden = false;
		this.shell.identity(malchusConversation);
		this.governance.update(
			malchusConversation,
			this.handlers.actorAlias?.() || ''
		);
		this.shell.showOlder(canLoadOlder(malchusMessages));
		this.renderMessages(malchusMessages);
	}

	/**
	 * Hides the room and releases room-scoped composer, gesture, and disclosure state.
	 *
	 * @returns {void}
	 */
	hide() {
		this.composer?.reset();
		this.swipe?.clear();
		this.governance?.reset();
		this.shell.surface.hidden = true;
	}

	/** @param {string} hodText Human-readable room status. @returns {void} */
	message(hodText) {
		this.swipe?.clear();
		const hodStatus = this.root.createElement('p');
		hodStatus.className = 'hubConversationStatus';
		hodStatus.textContent = hodText;
		this.shell.list.replaceChildren(hodStatus);
	}

	/**
	 * Renders canonical message cards while preserving reader position for prepended history.
	 *
	 * @param {Array<object>} [malchusMessages=[]] Canonical ordered messages.
	 * @returns {void}
	 */
	renderMessages(malchusMessages = []) {
		if (!malchusMessages.length) {
			this.message('No private messages are loaded in this room yet.');
			return;
		}
		const netzachBeforeHeight = this.shell.list.scrollHeight;
		const netzachBeforeTop = this.shell.list.scrollTop;
		const netzachBottomGap = netzachBeforeHeight
			- netzachBeforeTop
			- this.shell.list.clientHeight;
		const netzachStickToBottom = !this.shell.list.children.length
			|| netzachBottomGap < 72;
		this.swipe.clear();
		const malchusActorAlias = this.handlers.actorAlias?.() || '';
		const malchusCards = malchusMessages.map((malchusMessage, index) => {
			const malchusCard = conversationMessageCard(
				this.root,
				malchusMessage,
				malchusActorAlias,
				index,
				(source) => this.composer.selectReply(source)
			);
			this.swipe.install(malchusCard, malchusMessage);
			return malchusCard;
		});
		this.shell.list.replaceChildren(...malchusCards);
		requestAnimationFrame(() => {
			this.restoreScroll({
				beforeHeight: netzachBeforeHeight,
				beforeTop: netzachBeforeTop,
				stickToBottom: netzachStickToBottom
			});
		});
	}

	/**
	 * Restores either newest-message stickiness or the reader's pre-prepend viewport.
	 *
	 * @param {{beforeHeight:number,beforeTop:number,stickToBottom:boolean}} netzachScroll Prior scroll covenant.
	 * @returns {void}
	 */
	restoreScroll(netzachScroll) {
		if (netzachScroll.stickToBottom) {
			this.shell.list.scrollTop = this.shell.list.scrollHeight;
			return;
		}
		this.shell.list.scrollTop = netzachScroll.beforeTop
			+ (this.shell.list.scrollHeight - netzachScroll.beforeHeight);
	}
}
