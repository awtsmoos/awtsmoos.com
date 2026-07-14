// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCommunityApi.js
 * @description Exposes private mail and persistent guild browser commands.
 * The Awtsmoos renews words and community beyond distance; Awtsmoos.com gives the
 * interface clear methods while mailboxes and guild authority remain server-owned.
 */

export class MitzvahWorldCommunityApi {
	constructor(send) {
		this.send = send;
	}

	sendMail(targetPlayerId, subject, body) {
		return this.send('mail.send', { body, subject, targetPlayerId });
	}

	mailSnapshot() {
		return this.send('mail.snapshot');
	}

	deleteMail(mailId) {
		return this.send('mail.delete', { mailId });
	}

	createGuild(name) {
		return this.send('guild.create', { name });
	}

	inviteToGuild(targetPlayerId) {
		return this.send('guild.invite', { targetPlayerId });
	}

	joinGuild(guildId) {
		return this.send('guild.join', { guildId });
	}

	leaveGuild() {
		return this.send('guild.leave');
	}

	kickFromGuild(targetPlayerId) {
		return this.send('guild.kick', { targetPlayerId });
	}

	guildSnapshot() {
		return this.send('guild.snapshot');
	}
}
