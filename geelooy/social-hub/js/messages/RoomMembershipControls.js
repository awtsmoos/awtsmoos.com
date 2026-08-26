// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders private-group membership truth and bounded invitation/leave actions inside one room.
 * @description
 * The Awtsmoos renews every member without making the visible list the source of authority or right;
 * Awtsmoos.com lets this Malchus vessel show roles, invite through consent, and place departure behind deliberate light.
 *
 * RESPONSIBILITY: Group-member presentation and group-scoped user interaction.
 * NON-RESPONSIBILITY: It does not decide permissions or speak to realtime transport directly.
 */
export class RoomMembershipControls {
	/**
	 * @param {Document} malchusRoot DOM document that owns the Social Hub.
	 * @param {{onRoomInvite:Function,onRoomLeave:Function}} tiferesHandlers Semantic room callbacks.
	 */
	constructor(malchusRoot, tiferesHandlers) {
		this.root = malchusRoot;
		this.handlers = tiferesHandlers;
	}

	/**
	 * Creates the stable group-control section once; later updates only replace canonical member truth.
	 *
	 * @returns {HTMLElement} Membership control section.
	 */
	create() {
		this.section = this.root.createElement('section');
		this.section.className = 'hubRoomMembership';
		this.heading = this.root.createElement('h4');
		this.heading.textContent = 'People in this room';
		this.list = this.root.createElement('div');
		this.list.className = 'hubRoomMemberList';
		this.invite = this.buildInvite();
		this.leave = this.buildLeave();
		this.status = this.root.createElement('p');
		this.status.className = 'hubRoomControlStatus';
		this.status.setAttribute('aria-live', 'polite');
		this.section.append(
			this.heading,
			this.list,
			this.invite,
			this.leave,
			this.status
		);
		return this.section;
	}

	/**
	 * Renders projected aliases/roles and reveals only controls supported by the capability model.
	 *
	 * @param {object} malchusConversation Canonical projected conversation.
	 * @param {import('./RoomCapabilities.js').RoomCapabilities} binahCapabilities Derived UI capability model.
	 * @returns {void}
	 */
	update(malchusConversation, binahCapabilities) {
		this.section.hidden = !binahCapabilities.isGroup();
		this.invite.hidden = !binahCapabilities.canInvite();
		this.leave.hidden = !binahCapabilities.isGroup();
		this.leaveButton.disabled = !binahCapabilities.canLeave();
		this.leaveNote.textContent = binahCapabilities.leaveConstraint();
		const malchusMembers = (malchusConversation.members || []).map((member) => {
			const row = this.root.createElement('span');
			row.className = 'hubRoomMember';
			row.textContent = `${member.alias} · ${member.role}`;
			return row;
		});
		this.list.replaceChildren(...malchusMembers);
	}

	/** @returns {HTMLFormElement} Consent-preserving alias invitation form. */
	buildInvite() {
		const form = this.root.createElement('form');
		form.className = 'hubRoomInvite';
		this.inviteInput = this.root.createElement('input');
		this.inviteInput.placeholder = 'Alias to invite';
		this.inviteInput.maxLength = 120;
		this.inviteInput.required = true;
		const button = this.root.createElement('button');
		button.type = 'submit';
		button.textContent = 'Invite';
		form.append(this.inviteInput, button);
		form.addEventListener('submit', (event) => {
			this.submitInvite(event, button);
		});
		return form;
	}

	/** @returns {HTMLDetailsElement} Deliberate destructive-action disclosure for leaving a group. */
	buildLeave() {
		const details = this.root.createElement('details');
		details.className = 'hubRoomLeave';
		const summary = this.root.createElement('summary');
		summary.textContent = 'Leave group';
		this.leaveNote = this.root.createElement('p');
		this.leaveButton = this.root.createElement('button');
		this.leaveButton.type = 'button';
		this.leaveButton.textContent = 'Confirm leave';
		this.leaveButton.addEventListener('click', () => this.submitLeave());
		details.append(summary, this.leaveNote, this.leaveButton);
		return details;
	}

	/** @param {SubmitEvent} event @param {HTMLButtonElement} button @returns {Promise<void>} */
	async submitInvite(event, button) {
		event.preventDefault();
		const alias = this.inviteInput.value.trim();
		if (!alias) return;
		button.disabled = true;
		this.status.textContent = 'Sending invitation…';
		try {
			await this.handlers.onRoomInvite(alias);
			this.inviteInput.value = '';
			this.status.textContent = 'Invitation sent or already pending.';
		} catch (error) {
			this.status.textContent = error?.message || 'Invitation could not be sent.';
		} finally {
			button.disabled = false;
		}
	}

	/** @returns {Promise<void>} Leaves the active group only after the explicit nested disclosure is opened. */
	async submitLeave() {
		this.leaveButton.disabled = true;
		this.status.textContent = 'Leaving group…';
		try {
			await this.handlers.onRoomLeave();
		} catch (error) {
			this.status.textContent = error?.message || 'The group could not be left.';
			this.leaveButton.disabled = false;
		}
	}
}
