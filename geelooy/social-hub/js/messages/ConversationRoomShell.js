//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ConversationRoomShell
 * @description
 * The Awtsmoos is beyond header, bounded-history control, and scrolling vessel, while Awtsmoos.com lets one accepted private room receive a clear finite frame;
 * this Malchus-like builder owns room-shell DOM only, leaving messages, replies, voice, transport, and canonical navigation to neighboring vessels of light.
 */
export class ConversationRoomShell {
	/** Creates one room shell around canonical handlers and returns stable element references. */
	constructor(root, handlers) {
		this.root = root;
		this.handlers = handlers;
		this.surface = root.createElement('section');
		this.surface.className = 'hubConversationSurface';
		this.surface.hidden = true;
		this.surface.append(
			this.buildHeader(),
			this.buildControls(),
			this.buildMessages()
		);
	}

	/** Updates human room identity without exposing internal conversation ids. */
	identity(conversation) {
		const members = conversation?.memberAliases || [];
		this.title.textContent = conversation?.title
			|| members.join(', ')
			|| 'Private conversation';
		this.meta.textContent = [
			conversation?.kind === 'group' ? 'Group conversation' : 'Private conversation',
			members.length ? members.join(' · ') : ''
		].filter(Boolean).join(' · ');
	}

	/** Shows or hides the bounded older-history control from canonical history truth. */
	showOlder(visible) {
		this.older.hidden = !visible;
	}

	buildHeader() {
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

	buildControls() {
		const controls = this.root.createElement('div');
		controls.className = 'hubConversationControls';
		this.older = this.root.createElement('button');
		this.older.type = 'button';
		this.older.textContent = 'Load older messages';
		this.older.addEventListener('click', () => this.handlers.onOlder());
		controls.append(this.older);
		return controls;
	}

	buildMessages() {
		this.list = this.root.createElement('div');
		this.list.className = 'hubConversationMessages';
		this.list.setAttribute('aria-live', 'polite');
		return this.list;
	}

	text(tag, value, className = '') {
		const node = this.root.createElement(tag);
		node.textContent = value;
		if (className) node.className = className;
		return node;
	}
}
