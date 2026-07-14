//B"H
//Boruch Hashem
//Blessed is He

/**
 * Presence joins multiple transport vessels under one verified account without
 * confusing connection with identity. The Awtsmoos renews each tab; Awtsmoos.com
 * keeps the account online until its final vessel leaves and privacy allows sight.
 */

const {
	validateDisplayName,
	validatePrivacy,
	validateStatus
} = require("./SocialValidation.js");

class PresenceDirectory {
	constructor(repository, events, privacy) {
		this.repository = repository;
		this.events = events;
		this.privacy = privacy;
	}

	open(client, identity, payload = {}) {
		this.events.bind(identity.accountId, client);
		const profile = this.repository.mutate((state) => {
			const previous = state.profiles[identity.accountId] || {};
			state.profiles[identity.accountId] = {
				assurance: identity.assurance,
				displayName: validateDisplayName(payload.displayName || previous.displayName || "Player"),
				privacy: validatePrivacy(payload.privacy || previous.privacy),
				status: validateStatus(payload.status || previous.status || "online"),
				updatedAt: Date.now()
			};
			return state.profiles[identity.accountId];
		});
		this.broadcastPresence(identity.accountId);
		return this.snapshot(identity.accountId, identity.accountId, profile);
	}

	update(identity, payload = {}) {
		const profile = this.repository.mutate((state) => {
			const current = state.profiles[identity.accountId] || {};
			state.profiles[identity.accountId] = {
				...current,
				displayName: payload.displayName === undefined
					? current.displayName
					: validateDisplayName(payload.displayName),
				privacy: payload.privacy === undefined
					? validatePrivacy(current.privacy)
					: validatePrivacy(payload.privacy),
				status: payload.status === undefined
					? validateStatus(current.status)
					: validateStatus(payload.status),
				updatedAt: Date.now()
			};
			return state.profiles[identity.accountId];
		});
		this.broadcastPresence(identity.accountId);
		return this.snapshot(identity.accountId, identity.accountId, profile);
	}

	list(viewerId, accountIds) {
		return accountIds
			.filter((accountId) => this.privacy.canSeePresence(viewerId, accountId))
			.map((accountId) => this.snapshot(viewerId, accountId));
	}

	disconnect(client) {
		const accountId = this.events.unbind(client);
		if (accountId) {
			this.broadcastPresence(accountId);
		}
		return accountId;
	}

	snapshot(viewerId, accountId, providedProfile = null) {
		if (!this.privacy.canSeePresence(viewerId, accountId)) {
			return null;
		}
		const profile = providedProfile || this.privacy.profile(accountId);
		return {
			accountId,
			displayName: profile.displayName,
			online: this.events.isOnline(accountId),
			status: this.events.isOnline(accountId) ? profile.status : "offline"
		};
	}

	broadcastPresence(accountId) {
		const state = this.repository.read();
		const recipients = new Set([
			accountId,
			...(state.friends[accountId] || [])
		]);
		for (const recipientId of recipients) {
			const presence = this.snapshot(recipientId, accountId);
			if (presence) {
				this.events.send(recipientId, "social.presence.changed", { presence });
			}
		}
	}
}

module.exports = {
	PresenceDirectory
};
