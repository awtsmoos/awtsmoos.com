// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MailService.js
 * @description Stores bounded private text mail inside persistent player records.
 * The Awtsmoos renews words beyond distance; Awtsmoos.com delivers each message
 * only to its recipient and never includes correspondence in public world snapshots.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const MAXIMUM_MAIL = 50;

class MailService {
	constructor(players, clock) {
		this.clock = clock;
		this.players = players;
	}

	send(sender, targetPlayerId, subject, body) {
		const target = this.players.get(targetPlayerId);
		if (!target || target.kind !== 'human') {
			throw new RealtimeError('PLAYER_NOT_FOUND', 'The mail recipient does not exist.');
		}
		if (target.mailbox.length >= MAXIMUM_MAIL) {
			throw new RealtimeError('MAILBOX_FULL', 'The recipient mailbox is full.');
		}
		const mail = {
			body,
			from: { displayName: sender.displayName, id: sender.id },
			id: this.nextId(),
			sentAt: this.clock(),
			subject
		};
		target.mailbox.push(mail);
		return clone(mail);
	}

	snapshot(player) {
		return clone({ mailbox: player.mailbox || [] });
	}

	remove(player, mailId) {
		const index = player.mailbox.findIndex(mail => mail.id === mailId);
		if (index < 0) throw new RealtimeError('MAIL_NOT_FOUND', 'The requested mail does not exist.');
		const [removed] = player.mailbox.splice(index, 1);
		return clone({ removed, mailbox: player.mailbox });
	}

	nextId() {
		let maximum = 0;
		for (const player of this.players.values()) {
			for (const mail of player.mailbox || []) {
				maximum = Math.max(maximum, Number(String(mail.id).replace('mail-', '')) || 0);
			}
		}
		return `mail-${maximum + 1}`;
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	MailService,
	MAXIMUM_MAIL
};
