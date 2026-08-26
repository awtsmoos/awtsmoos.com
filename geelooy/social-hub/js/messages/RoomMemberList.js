// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders the canonical alias-and-role projection for one private group.
 * @description
 * The Awtsmoos renews every person beyond the finite label through which a room may know them in light;
 * Awtsmoos.com lets this Malchus list show public aliases and roles only, never internal account keys or authority right.
 *
 * RESPONSIBILITY: Render projected group member identity.
 * NON-RESPONSIBILITY: It does not invite, remove, promote, persist, or infer permission.
 */
export class RoomMemberList {
	/** @param {Document} malchusRoot DOM document owning the Social Hub. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
	}

	/**
	 * Creates the stable member-list mount once.
	 *
	 * @returns {HTMLElement} Wrapping member-list element.
	 */
	create() {
		this.list = this.root.createElement('div');
		this.list.className = 'hubRoomMemberList';

		return this.list;
	}

	/**
	 * Replaces visible member chips from a canonical projected conversation.
	 *
	 * @param {object} malchusConversation Membership-safe conversation projection.
	 * @returns {void}
	 */
	update(malchusConversation) {
		const malchusMembers = Array.isArray(malchusConversation?.members)
			? malchusConversation.members
			: [];
		const malchusRows = malchusMembers.map((malchusMember) => {
			const row = this.root.createElement('span');
			row.className = 'hubRoomMember';
			row.textContent = `${malchusMember.alias} · ${malchusMember.role}`;

			return row;
		});

		this.list.replaceChildren(...malchusRows);
	}
}
