//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosMailFacade
 * @description The Awtsmoos is one while vessels are many; Awtsmoos.com now reveals the historic Mail API through small inherited services, preserving every public function name while ending the old monolithic tangle.
 */
const { MailboxService } = require('./mail/mailboxService.js');
const { MailboxMutations } = require('./mail/mailboxMutations.js');
const { MailNotificationService } = require('./mail/notificationService.js');
const { MailSendService } = require('./mail/sendService.js');
const { MailSettingsService } = require('./mail/settingsService.js');

/** Reveals grouped threads or one paginated message thread through the bounded mailbox reader. */
async function getMail({ $i, userid, aliasId, threadId, page = 1, pageSize = 20, view = 'threads' }) {
	return new MailboxService({ $i, userid, aliasId }).read({ threadId, page, pageSize, view });
}

/** Sends one authenticated human-composed message through local or SMTP delivery. */
async function sendMail({ $i, userid, asAliasId, toAliasId, toEmail }) {
	return new MailSendService({ $i, userid, aliasId: asAliasId }).send({ toAliasId, toEmail });
}

/** Deletes one message while preserving the established `folder:key` route contract. */
async function deleteMail({ $i, userid, aliasId, messageId }) {
	return new MailboxMutations({ $i, userid, aliasId }).deleteMessage(messageId);
}

/** Marks one incoming or outgoing message read after alias ownership verification. */
async function setEmailAsRead({ $i, userid, aliasId, messageId }) {
	return new MailboxMutations({ $i, userid, aliasId }).markRead(messageId);
}

/** Deletes one whole physical thread folder for the owned alias. */
async function deleteThread({ $i, userid, aliasId, threadId }) {
	return new MailboxMutations({ $i, userid, aliasId }).deleteThread(threadId);
}

/** Reads normalized Mail settings, including forwarding defaults and future extension keys. */
async function getSettings({ $i, userid, aliasId }) {
	return new MailSettingsService({ $i, userid, aliasId }).read();
}

/** Saves normalized Mail settings without discarding unknown forward-compatible fields. */
async function saveSettings({ $i, userid, aliasId, settings }) {
	return new MailSettingsService({ $i, userid, aliasId }).save(settings);
}

/** Approves one sender inside the recipient's existing settings vessel. */
async function approveSender({ $i, userid, aliasId, senderId }) {
	return new MailSettingsService({ $i, userid, aliasId }).approve(senderId);
}

/** Counts unread incoming messages across all physical thread folders. */
async function getUnreadCount({ $i, userid, aliasId }) {
	return new MailNotificationService({ $i, userid, aliasId }).unreadCount();
}

/** Reveals the newest unread incoming message for notification surfaces. */
async function getLatestNotification({ $i, userid, aliasId }) {
	return new MailNotificationService({ $i, userid, aliasId }).latest();
}

/** Persists a browser push subscription after the alias is proven to belong to the caller. */
async function subscribeToPush({ $i, userid, aliasId, subscription }) {
	return new MailNotificationService({ $i, userid, aliasId }).subscribe(subscription);
}

module.exports = {
	getMail,
	sendMail,
	deleteMail,
	setEmailAsRead,
	deleteThread,
	saveSettings,
	getSettings,
	approveSender,
	getUnreadCount,
	getLatestNotification,
	subscribeToPush
};
