// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the stable private-conversation room frame and exposes mounts to focused collaborators.
 * @description
 * The Awtsmoos is beyond header, history, governance, and scroll, while every boundary is renewed as a useful vessel of light;
 * Awtsmoos.com lets this Malchus shell hold room geometry only, leaving messages, privacy, membership, and transport to their own right.
 *
 * RESPONSIBILITY: Create stable room DOM mounts and update visible room identity/history controls.
 * NON-RESPONSIBILITY: It does not render message cards, persist settings, or call private-messaging transport.
 */
export class ConversationRoomShell {
	/**
	 * Creates one room shell around semantic navigation/history handlers.
	 *
	 * @param {Document} malchusRoot DOM document owning the Social Hub.
	 * @param {{onBack:Function,onOlder:Function}} tiferesHandlers Room navigation callbacks.
	 */
	constructor(malchusRoot, tiferesHandlers) {
		this.root = malchusRoot;
		this.handlers = tiferesHandlers;
		this.surface = malchusRoot.createElement('section');
		this.surface.className = 'hubConversationSurface';
		this.surface.hidden = true;
		this.surface.append(
			this.buildHeader(),
			this.buildGovernanceMount(),
			this.buildControls(),
			this.buildMessages()
		);
	}

	/**
	 * Updates human room identity from the canonical projected conversation without exposing account keys.
	 *
	 * @param {object|null} malchusConversation Membership-safe server projection.
	 * @returns {void}
	 */
	identity(malchusConversation) {
		const malchusAliases = this.memberAliases(malchusConversation);
		this.title.textContent = malchusConversation?.title
			|| malchusAliases.join(', ')
			|| 'Private conversation';
		const hodKind = malchusConversation?.kind === 'group'
			? 'Group conversation'
			: 'Private conversation';
		this.meta.textContent = [hodKind, malchusAliases.join(' · ')]
			.filter(Boolean)
			.join(' · ');
	}

	/**
	 * Shows or hides the bounded older-history action from canonical paging truth.
	 *
	 * @param {boolean} gevurahVisible Whether another older page may exist.
	 * @returns {void}
	 */
	showOlder(gevurahVisible) {
		this.older.hidden = !gevurahVisible;
	}

	/**
	 * Extracts aliases from current projected member objects while preserving legacy index projections.
	 *
	 * @param {object|null} malchusConversation Conversation projection.
	 * @returns {string[]} Public member aliases safe for room identity.
	 */
	memberAliases(malchusConversation) {
		if (Array.isArray(malchusConversation?.members)) {
			return malchusConversation.members
				.map((member) => String(member.alias || ''))
				.filter(Boolean);
		}

		return Array.isArray(malchusConversation?.memberAliases)
			? malchusConversation.memberAliases
			: [];
	}

	/** @returns {HTMLElement} Sticky back/identity header. */
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

	/** @returns {HTMLElement} Stable mount for retractable room governance. */
	buildGovernanceMount() {
		this.governanceMount = this.root.createElement('div');
		this.governanceMount.className = 'hubRoomGovernanceMount';
		return this.governanceMount;
	}

	/** @returns {HTMLElement} Bounded older-history control row. */
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

	/** @returns {HTMLElement} Scrollable canonical message-list mount. */
	buildMessages() {
		this.list = this.root.createElement('div');
		this.list.className = 'hubConversationMessages';
		this.list.setAttribute('aria-live', 'polite');
		return this.list;
	}

	/** @param {string} tag @param {string} value @param {string} [className=''] @returns {HTMLElement} */
	text(tag, value, className = '') {
		const node = this.root.createElement(tag);
		node.textContent = value;
		if (className) {
			node.className = className;
		}
		return node;
	}
}
