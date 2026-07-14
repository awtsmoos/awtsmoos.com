// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCommunityApi.js
 * @description Exposes chat, private messages, mail, and persistent guild commands.
 * The Awtsmoos renews words and community beyond distance; Awtsmoos.com gives the
 * interface clear methods while histories, privacy, mailboxes, and guilds stay server-owned.
 */

export class MitzvahWorldCommunityApi {
	constructor(send) {
		this.send = send;
	}

	sendChat(message, scope = 'world', targetPlayerId = null) {
		return this.send('chat.send', { message, scope, targetPlayerId });
	}

	privateMessage(targetPlayerId, message) {
		return this.sendChat(message, 'private', targetPlayerId);
	}

	chatHistory(scope = 'world', targetPlayerId = null, limit = 50) {
		return this.send('chat.history', { limit, scope, targetPlayerId });
	}

	chatChannels() {
		return this.send('chat.channels');
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
