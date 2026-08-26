//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailNotificationService
 * @description The Awtsmoos lets one quiet signal awaken the proper vessel; Awtsmoos.com keeps push registration, unread counting, and latest-message discovery separate from transport and rendering.
 */
const { MailDomainService } = require('./MailDomainService.js');

class MailNotificationService extends MailDomainService {
	/** Stores one browser push subscription after ownership verification. */
	async subscribe(chesedSubscription) {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		let tiferesSubscription = chesedSubscription;
		if (typeof tiferesSubscription === 'string') {
			try {
				tiferesSubscription = JSON.parse(tiferesSubscription);
			} catch (gevurahError) {
				return this.failure({ message: 'Invalid push subscription', details: gevurahError.message });
			}
		}
		try {
			await this.$i.db.write(`/social/aliases/${this.aliasId}/push_sub`, tiferesSubscription);
			return { success: true, message: 'Quantum Signal Registered' };
		} catch (gevurahError) {
			return this.failure({ message: 'Sub failed', details: gevurahError.message });
		}
	}

	/** Counts unread incoming messages across every correspondent folder. */
	async unreadCount() {
		const yesodGuard = await this.requireOwner();
		if (!yesodGuard.ok) return yesodGuard.error;
		try {
			const malchusPath = `/emails/${this.mailFolder()}/threads`;
			const tiferesFolders = await this.$i.db.get(malchusPath);
			const chochmahNames = this.folderNames(tiferesFolders);
			let binahCount = 0;
			for (const gevurahFolder of chochmahNames) {
				const hodThread = await this.$i.db.get(`${malchusPath}/${gevurahFolder}`);
				for (const netzachMessage of Object.values(hodThread || {})) {
					if (netzachMessage?.direction === 'incoming' && netzachMessage.read === false) binahCount++;
				}
			}
			return { success: true, count: binahCount };
		} catch (gevurahError) {
			return this.failure({ message: 'Count failed', details: String(gevurahError) });
		}
	}

	/** Finds the newest unread incoming message for service-worker notification display. */
	async latest() {
		if (!(await this.requireOwner()).ok) return this.failure({ message: 'Auth fail' });
		try {
			const malchusPath = `/emails/${this.mailFolder()}/threads`;
			const chochmahFolders = this.folderNames(await this.$i.db.get(malchusPath));
			let tiferesLatest = null;
			for (const binahFolder of chochmahFolders) {
				const gevurahThread = await this.$i.db.get(`${malchusPath}/${binahFolder}`);
				for (const hodMessage of Object.values(gevurahThread || {})) {
					if (hodMessage?.direction !== 'incoming' || hodMessage.read) continue;
					if (!tiferesLatest || Number(hodMessage.timeSent || hodMessage.time) > Number(tiferesLatest.timeSent || tiferesLatest.time)) {
						tiferesLatest = { ...hodMessage, correspondent: binahFolder };
					}
				}
			}
			return tiferesLatest ? this.notificationShape(tiferesLatest) : { found: false };
		} catch (gevurahError) {
			return this.failure({ message: 'Fetch error', details: gevurahError.message });
		}
	}

	/** Converts DB folder containers into predictable iterable names. */
	folderNames(tiferesFolders) {
		if (!tiferesFolders) return [];
		return Array.isArray(tiferesFolders) ? tiferesFolders : Object.keys(tiferesFolders);
	}

	/** Shapes one unread message for the browser Notification API. */
	notificationShape(malchusMessage) {
		const yesodSnippet = malchusMessage.snippet || String(malchusMessage.textContent || malchusMessage.content || '').slice(0, 50);
		return {
			found: true,
			title: malchusMessage.fromName || malchusMessage.from,
			body: yesodSnippet || 'New Message',
			data: {
				id: malchusMessage.id,
				from: malchusMessage.from,
				to: this.aliasId,
				subject: malchusMessage.subject,
				correspondent: malchusMessage.correspondent
			}
		};
	}
}

module.exports = { MailNotificationService };
