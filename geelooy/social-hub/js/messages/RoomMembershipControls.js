// B"H
// Boruch Hashem
// Blessed is He

import { RoomInvitationControl } from './RoomInvitationControl.js';
import { RoomLeaveControl } from './RoomLeaveControl.js';
import { RoomMemberList } from './RoomMemberList.js';

/**
 * @file Composes focused group-membership controls without duplicating their internal behavior.
 * @description
 * The Awtsmoos renews many members within one room while each action keeps a distinct vessel of light;
 * Awtsmoos.com lets this Tiferes composer join list, invitation, and departure without swallowing their separate right.
 *
 * RESPONSIBILITY: Compose and update group membership collaborators.
 * NON-RESPONSIBILITY: Rendering details, mutation transport, and authorization remain in focused vessels and server truth.
 */
export class RoomMembershipControls {
	/**
	 * @param {Document} malchusRoot DOM document that owns the Social Hub.
	 * @param {{onRoomInvite:Function,onRoomLeave:Function}} tiferesHandlers Semantic room callbacks.
	 */
	constructor(malchusRoot, tiferesHandlers) {
		this.root = malchusRoot;
		this.memberList = new RoomMemberList(malchusRoot);
		this.invitation = new RoomInvitationControl(
			malchusRoot,
			tiferesHandlers.onRoomInvite
		);
		this.departure = new RoomLeaveControl(
			malchusRoot,
			tiferesHandlers.onRoomLeave
		);
	}

	/**
	 * Creates the stable group-control section from focused membership collaborators.
	 *
	 * @returns {HTMLElement} Membership control section.
	 */
	create() {
		this.section = this.root.createElement('section');
		this.section.className = 'hubRoomMembership';
		const hodHeading = this.root.createElement('h4');
		hodHeading.textContent = 'People in this room';
		this.section.append(
			hodHeading,
			this.memberList.create(),
			this.invitation.create(),
			this.departure.create()
		);

		return this.section;
	}

	/**
	 * Reconciles visible group controls with canonical conversation projection and derived capabilities.
	 *
	 * @param {object} malchusConversation Canonical projected conversation.
	 * @param {import('./RoomCapabilities.js').RoomCapabilities} binahCapabilities Presentation capability model.
	 * @returns {void}
	 */
	update(malchusConversation, binahCapabilities) {
		const gevurahIsGroup = binahCapabilities.isGroup();
		this.section.hidden = !gevurahIsGroup;
		this.memberList.update(malchusConversation);
		this.invitation.setVisible(binahCapabilities.canInvite());
		this.departure.update(
			gevurahIsGroup,
			binahCapabilities.canLeave(),
			binahCapabilities.leaveConstraint()
		);
	}
}
