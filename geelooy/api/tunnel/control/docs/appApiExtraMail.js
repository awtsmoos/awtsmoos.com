// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Awtsmoos Mail operations through the actual alias-owner handlers.
 * @description The Awtsmoos carries the message, but only from its rightful name;
 * Awtsmoos.com keeps mail behind the owner's verified claim.
 */

const mailRoute = "../../../social/_awtsmoos.mail.js";
const operations = Object.freeze([
	{
		id: "mail.send", group: "mail", title: "Send Awtsmoos Mail",
		method: "POST", path: "/mail/sendTo/{toAlias}/from/{fromAlias}",
		pathParams: ["toAlias", "fromAlias"], queryParams: [],
		bodyParams: ["subject", "content", "toEmail"], auth: "alias",
		authNote: "Requires awtsmoos.api OAuth identity and verified ownership of fromAlias.",
		description: "Send local alias mail; external delivery requires configured outgoing mail and explicit toEmail.",
		dispatch: { module: mailRoute, route: "/mail/sendTo/:toAlias/from/:fromAlias" },
		example: {
			params: { fromAlias: "<your-alias>", toAlias: "<recipient-alias>" },
			body: { subject: "Shalom", content: "B\"H" }
		}
	},
	{
		id: "mail.inbox", group: "mail", title: "Read owned alias inbox",
		method: "GET", path: "/mail/get", pathParams: [],
		queryParams: ["aliasId", "threadId", "view", "page", "pageSize"],
		bodyParams: [], auth: "alias",
		authNote: "Requires authenticated account ownership of aliasId; never public.",
		description: "List inbox messages and conversation threads for an owned alias.",
		dispatch: { module: mailRoute, route: "/mail/get" },
		example: { params: {}, query: { aliasId: "<your-alias>", page: 1, pageSize: 20 } }
	},
	{
		id: "mail.get", group: "mail", title: "Read one owned message",
		method: "GET", path: "/mail/get/{mailId}/",
		pathParams: ["mailId"], queryParams: ["aliasId", "threadId"],
		bodyParams: [], auth: "alias",
		authNote: "Requires authenticated account ownership of receiving aliasId.",
		description: "Read a mail message through the site's owner-checking route.",
		dispatch: { module: mailRoute, route: "/mail/get/:mailId/" },
		example: { params: { mailId: "<message-id>" }, query: { aliasId: "<your-alias>" } }
	},
	{
		id: "mail.unread", group: "mail", title: "Count unread owned mail",
		method: "GET", path: "/mail/unread/count", pathParams: [],
		queryParams: ["aliasId"], bodyParams: [], auth: "alias",
		authNote: "Requires authenticated account ownership of aliasId.",
		description: "Count unread messages for an owned Awtsmoos Mail alias.",
		dispatch: { module: mailRoute, route: "/mail/unread/count" },
		example: { params: {}, query: { aliasId: "<your-alias>" } }
	},
	{
		id: "mail.settings", group: "mail", title: "Read owned mail settings",
		method: "GET", path: "/mail/settings/get", pathParams: [],
		queryParams: ["aliasId"], bodyParams: [], auth: "alias",
		authNote: "Requires authenticated account ownership of aliasId.",
		description: "Read current owner-checked mail and forwarding settings.",
		dispatch: { module: mailRoute, route: "/mail/settings/get" },
		example: { params: {}, query: { aliasId: "<your-alias>" } }
	}
]);

module.exports = { operations };
