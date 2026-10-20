//B"H
//Blessed is He
//Boruch Hashem


/**
 * Mail slice of the helper index.
 * Split sibling of index.js (verbatim relocation).
 */

var {
    getMail,
    sendMail,
    deleteMail,
    setEmailAsRead,
    deleteThread,
    saveSettings,
    getSettings,
    approveSender,
    getUnreadCount,
    subscribeToPush,
    getLatestNotification
} = require("./mail.js");

module.exports = {
	getMail,
	deleteMail,
	setEmailAsRead,
	sendMail,
	deleteThread,
	saveSettings,
	getSettings,
	approveSender,
	getUnreadCount,
	subscribeToPush,
	getLatestNotification
};
