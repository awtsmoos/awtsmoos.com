// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives presentation-safe private-room capabilities from canonical projected conversation truth.
 * @description
 * The Awtsmoos renews possibility and boundary together; capability is the light, canonical membership is its measured vessel in sight;
 * Awtsmoos.com lets this Binah-like model organize what the UI may reveal without pretending client inference grants server right.
 *
 * RESPONSIBILITY: Derive non-authoritative UI affordances from `kind`, aliases, and projected roles.
 * NON-RESPONSIBILITY: The server remains sovereign over every permission and mutation.
 */
export class RoomCapabilities {
	/**
	 * Creates one immutable capability view for the current actor inside one projected conversation.
	 *
	 * @param {object|null} malchusConversation Membership-safe conversation projection.
	 * @param {string} malchusActorAlias Active public alias used by the Social Hub.
	 */
	constructor(malchusConversation, malchusActorAlias) {
		this.conversation = malchusConversation || {};
		this.actorAlias = String(malchusActorAlias || '');
		this.members = Array.isArray(this.conversation.members)
			? this.conversation.members
			: [];
		this.actor = this.members.find((member) => {
			return member.alias === this.actorAlias;
		}) || null;
	}

	/**
	 * Returns whether the room is a canonical private group.
	 *
	 * @returns {boolean} True only for server-projected `group` conversations.
	 */
	isGroup() {
		return this.conversation.kind === 'group';
	}

	/**
	 * Returns whether the actor may be offered a group-invite control.
	 * Server authorization is still rechecked on every request.
	 *
	 * @returns {boolean} True for projected owner/admin group membership.
	 */
	canInvite() {
		return this.isGroup()
			&& ['owner', 'admin'].includes(this.actor?.role);
	}

	/**
	 * Returns whether leaving can be offered without a known owner-transfer conflict.
	 *
	 * @returns {boolean} False only when the actor is owner of a multi-member group.
	 */
	canLeave() {
		if (!this.isGroup()) {
			return false;
		}

		return !(this.actor?.role === 'owner' && this.members.length > 1);
	}

	/**
	 * Explains why a group owner cannot currently leave.
	 *
	 * @returns {string} Empty when leaving is available, otherwise a concise requirement.
	 */
	leaveConstraint() {
		if (this.canLeave()) {
			return '';
		}

		return this.isGroup()
			? 'Transfer ownership before leaving this group.'
			: '';
	}

	/**
	 * Finds the other visible alias in a direct conversation for future block/contact controls.
	 *
	 * @returns {string} Peer alias, or empty when the room is not a two-party direct conversation.
	 */
	peerAlias() {
		if (this.isGroup()) {
			return '';
		}

		const peer = this.members.find((member) => {
			return member.alias !== this.actorAlias;
		});

		return String(peer?.alias || '');
	}
}
