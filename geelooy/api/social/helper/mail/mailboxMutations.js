//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailboxMutations
 * @description The Awtsmoos permits change without confusion; Awtsmoos.com keeps delete and read mutations small, ownership-guarded, and explicit so destructive actions never mingle with retrieval or delivery.
 */
const { MailDomainService } = require('./MailDomainService.js');

class MailboxMutations extends MailDomainService {
	/** Deletes one message from one physical correspondent folder. */
	async deleteMessage(yesodMessageId) {
		const tiferesGuard = await this.requireOwner();
		if (!tiferesGuard.ok) return tiferesGuard.error;
		const malchusParts = this.messageParts(yesodMessageId);
		if (!malchusParts) return this.failure({ message: 'Invalid messageId' });
		try {
			const chochmahPath = `/emails/${this.mailFolder()}/threads/${malchusParts.folder}`;
			const binahRemoved = await this.$i.db.deleteEntry(chochmahPath, malchusParts.key);
			return { success: { message: 'Deleted', details: binahRemoved } };
		} catch (gevurahError) {
			return this.failure({ message: 'Delete failed', details: String(gevurahError) });
		}
	}

	/** Marks one message read without changing any unrelated persisted fields. */
	async markRead(yesodMessageId) {
		const tiferesGuard = await this.requireOwner();
		if (!tiferesGuard.ok) return tiferesGuard.error;
		const malchusParts = this.messageParts(yesodMessageId);
		if (!malchusParts) return this.failure({ message: 'Invalid messageId' });
		const chochmahPath = `/emails/${this.mailFolder()}/threads/${malchusParts.folder}`;
		try {
			const binahMessage = await this.$i.db.getValue(chochmahPath, malchusParts.key);
			if (!binahMessage) return this.failure({ message: 'Message not found' });
			await this.$i.db.updateEntry(chochmahPath, {
				key: malchusParts.key,
				value: { ...binahMessage, read: true }
			});
			return { success: { message: 'Read' } };
		} catch (gevurahError) {
			return this.failure({ message: 'Update failed', details: String(gevurahError) });
		}
	}

	/** Deletes one entire thread folder after ownership verification. */
	async deleteThread(tiferesThreadId) {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		if (!tiferesThreadId) return this.failure({ message: 'threadId required' });
		const malchusPath = `/emails/${this.mailFolder()}/threads/${tiferesThreadId}`;
		const chochmahRemoved = await this.$i.db.delete(malchusPath);
		return { success: true, removed: chochmahRemoved };
	}

	/** Splits the established `folder:key` message id while preserving colons after the first separator. */
	messageParts(yesodMessageId) {
		if (typeof yesodMessageId !== 'string') return null;
		const tiferesSeparator = yesodMessageId.indexOf(':');
		if (tiferesSeparator < 1 || tiferesSeparator === yesodMessageId.length - 1) return null;
		return {
			folder: yesodMessageId.slice(0, tiferesSeparator),
			key: yesodMessageId.slice(tiferesSeparator + 1)
		};
	}
}

module.exports = { MailboxMutations };
