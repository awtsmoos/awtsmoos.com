//B"H
//Boruch Hashem
//Blessed is He

import { ConversationComposer } from './ConversationComposer.js';
import { canLoadOlder } from './ConversationHistory.js';
import { conversationMessageCard } from './ConversationMessageCard.js';
import { ConversationMessageNavigator } from './ConversationMessageNavigator.js';
import { ConversationRoomShell } from './ConversationRoomShell.js';
import { ConversationSwipeReply } from './ConversationSwipeReply.js';

/**
 * @class ConversationView
 * @description
 * The Awtsmoos renews speaker, quote, audible breath, written word, and scroll position before one private room can appear;
 * Awtsmoos.com lets this Tiferes-like view render canonical message truth while room-shell construction, transport, and reply state remain in focused neighboring vessels of light.
 */
export class ConversationView {
	constructor(root) {
		this.root = root;
	}

	/** Composes the room shell, rich composer, quote navigator, and swipe enhancement once. */
	initialize(container, handlers) {
		this.handlers = handlers;
		this.shell = new ConversationRoomShell(this.root, handlers);
		this.composer = new ConversationComposer(this.root, {
			onSend: handlers.onSend,
			onSendVoice: handlers.onSendVoice,
			actorAlias: handlers.actorAlias
		});
		this.shell.surface.append(this.composer.create());
		this.navigator = new ConversationMessageNavigator(this.shell.list);
		this.swipe = new ConversationSwipeReply(message => {
			this.composer.selectReply(message);
		});
		container.append(this.shell.surface);
	}

	/** Reveals human room identity and canonical messages without exposing internal room ids. */
	show(conversation, messages) {
		this.shell.surface.hidden = false;
		this.shell.identity(conversation);
		this.shell.showOlder(canLoadOlder(messages));
		this.renderMessages(messages);
	}

	/** Hides the room and releases room-scoped composer and gesture state. */
	hide() {
		this.composer?.reset();
		this.swipe?.clear();
		this.shell.surface.hidden = true;
	}

	/** Replaces the message region with one truthful status sentence. */
	message(text) {
		this.swipe?.clear();
		const status = this.root.createElement('p');
		status.className = 'hubConversationStatus';
		status.textContent = text;
		this.shell.list.replaceChildren(status);
	}

	/** Renders canonical cards while preserving reader position for prepended history. */
	renderMessages(messages = []) {
		if (!messages.length) {
			this.message('No private messages are loaded in this room yet.');
			return;
		}
		const beforeHeight = this.shell.list.scrollHeight;
		const beforeTop = this.shell.list.scrollTop;
		const bottomGap = beforeHeight - beforeTop - this.shell.list.clientHeight;
		const stickToBottom = !this.shell.list.children.length || bottomGap < 72;
		this.swipe.clear();
		const actorAlias = this.handlers.actorAlias?.() || '';
		const cards = messages.map((message, index) => {
			const card = conversationMessageCard(
				this.root,
				message,
				actorAlias,
				index,
				source => this.composer.selectReply(source)
			);
			this.swipe.install(card, message);
			return card;
		});
		this.shell.list.replaceChildren(...cards);
		requestAnimationFrame(() => this.restoreScroll({
			beforeHeight,
			beforeTop,
			stickToBottom
		}));
	}

	/** Restores either newest-message stickiness or the reader's pre-prepend viewport. */
	restoreScroll({ beforeHeight, beforeTop, stickToBottom }) {
		if (stickToBottom) {
			this.shell.list.scrollTop = this.shell.list.scrollHeight;
			return;
		}
		this.shell.list.scrollTop = beforeTop
			+ (this.shell.list.scrollHeight - beforeHeight);
	}
}
