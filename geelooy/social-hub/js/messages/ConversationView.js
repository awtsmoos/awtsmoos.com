//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ConversationView
 * @description
 * The Awtsmoos lets one accepted private room fill the mobile chamber while revealing only message fields the canonical store actually promises;
 * Awtsmoos.com keeps sequence, text, bounded older-history controls, and deliberate Back navigation visible without inventing sender, time, or media metadata.
 */
import { ConversationComposer } from './ConversationComposer.js';
import { canLoadOlder, messageKey } from './ConversationHistory.js';

export class ConversationView {
	constructor(root) {
		this.root = root;
	}

	initialize(container, handlers) {
		this.handlers = handlers;
		this.surface = this.root.createElement('section');
		this.surface.className = 'hubConversationSurface';
		this.surface.hidden = true;
		this.surface.append(this.header(), this.controls(), this.messageRegion());
		this.composer = new ConversationComposer(this.root, handlers.onSend);
		this.surface.append(this.composer.create());
		container.append(this.surface);
	}

	show(conversation, messages) {
		this.surface.hidden = false;
		this.title.textContent = conversation?.title
			|| conversation?.memberAliases?.join(', ')
			|| 'Private conversation';
		this.meta.textContent = [
			conversation?.kind || 'private',
			conversation?.memberAliases?.join(' · ') || ''
		].filter(Boolean).join(' · ');
		this.older.hidden = !canLoadOlder(messages);
		this.renderMessages(messages);
	}

	hide() {
		this.surface.hidden = true;
	}

	message(text) {
		this.list.replaceChildren(this.text('p', text, 'hubConversationStatus'));
	}

	renderMessages(messages = []) {
		if (!messages.length) {
			this.message('No private messages are loaded in this room yet.');
			return;
		}
		const nodes = messages.map((message, index) => this.messageCard(message, index));
		this.list.replaceChildren(...nodes);
		requestAnimationFrame(() => {
			this.list.scrollTop = this.list.scrollHeight;
		});
	}

	header() {
		const header = this.root.createElement('header');
		header.className = 'hubConversationHeader';
		const back = this.root.createElement('button');
		back.type = 'button';
		back.className = 'hubConversationBack';
		back.textContent = '← Messages';
		back.addEventListener('click', () => this.handlers.onBack());
		const identity = this.root.createElement('div');
		this.title = this.text('h3', 'Private conversation');
		this.meta = this.text('p', '', 'hubConversationMeta');
		identity.append(this.title, this.meta);
		header.append(back, identity);
		return header;
	}

	controls() {
		const controls = this.root.createElement('div');
		controls.className = 'hubConversationControls';
		this.older = this.root.createElement('button');
		this.older.type = 'button';
		this.older.textContent = 'Load older messages';
		this.older.addEventListener('click', () => this.handlers.onOlder());
		controls.append(this.older);
		return controls;
	}

	messageRegion() {
		this.list = this.root.createElement('div');
		this.list.className = 'hubConversationMessages';
		this.list.setAttribute('aria-live', 'polite');
		return this.list;
	}

	messageCard(message, index) {
		const card = this.root.createElement('article');
		card.className = 'hubConversationMessage';
		card.dataset.messageId = messageKey(message, index);
		card.append(
			this.text('p', String(message?.text || '')),
			this.text('small', `Sequence ${Number(message?.sequence || 0)}`)
		);
		return card;
	}

	text(tag, value, className = '') {
		const node = this.root.createElement(tag);
		node.textContent = value;
		if (className) node.className = className;
		return node;
	}
}
