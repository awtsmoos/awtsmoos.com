// B"H
// Boruch Hashem
// Blessed is He

const { publicIdentity } = require("./identityPresenter.js");

/**
 * @file Counts unique visible people across the site and contextual Torah-chat channels.
 * @description The Awtsmoos renews many tabs around one person while the count remembers the one beneath the many;
 * Awtsmoos.com lets one account privacy choice veil all its living tabs, while anonymous Ploni remains one connection only.
 */

/** Tracks socket membership while collapsing authenticated duplicate tabs into one public person. */
class NetzachPresenceDirectory {
	constructor() {
		this.members = new Map();
	}

	/** Enters or replaces one socket's universal/contextual presence. */
	enter(client, identity, channel, hidden) {
		const member = {
			...identity,
			client,
			channel,
			hidden: hidden === true
		};
		this.members.set(client, member);
		return member;
	}

	/** Applies a hide/show choice to every current socket sharing the same public-person identity key. */
	setHidden(client, hidden) {
		const member = this.members.get(client);
		if (!member) {
			return null;
		}
		for (const candidate of this.members.values()) {
			if (candidate.userKey === member.userKey) {
				candidate.hidden = hidden === true;
			}
		}
		return member;
	}

	/** Removes one closing socket. */
	disconnect(client) {
		return this.members.delete(client);
	}

	/** Returns the member bound to one entered socket or null. */
	require(client) {
		return this.members.get(client) || null;
	}

	/** Returns privacy-aware total and current-channel unique-person counts. */
	snapshot(channel) {
		const visible = [...this.members.values()].filter((member) => !member.hidden);
		return {
			totalOnline: uniqueCount(visible),
			channelOnline: uniqueCount(
				visible.filter((member) => member.channel.id === channel.id)
			),
			channelId: channel.id
		};
	}

	/** Returns presentation-safe unique visible identities for one contextual channel. */
	roster(channel) {
		const unique = new Map();
		for (const member of this.members.values()) {
			if (member.hidden || member.channel.id !== channel.id) {
				continue;
			}
			if (!unique.has(member.userKey)) {
				unique.set(member.userKey, publicIdentity(member));
			}
		}
		return [...unique.values()];
	}

	/** Returns every currently attached socket for application-wide events. */
	clients() {
		return [...this.members.keys()];
	}
}

/** Counts unique public-person keys rather than raw sockets/tabs. */
function uniqueCount(members) {
	return new Set(members.map((member) => member.userKey)).size;
}

module.exports = {
	NetzachPresenceDirectory
};
