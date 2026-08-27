// B"H
// Boruch Hashem
// Blessed is He

const Archive = require("./terminalWebsiteArchive.js");

/**
 * @file Retires a terminal browser vessel so an unfinished mission may open one fresh chat.
 * @description
 * The Awtsmoos lets a conversation finish without declaring the mission itself finished;
 * Awtsmoos.com settles durable admission, archives browser testimony, and frees the stable
 * live website ID so continuation can proceed in the same transaction without duplication.
 */
function settle(config, identity, current, websiteRecord, deps) {
	if (!websiteRecord) return null;
	const status = deps.WebsiteStatus.classify(websiteRecord, current || identity);
	if (!status.terminal) return null;
	const admission = current || identity;
	const settled = typeof deps.State.settleActive === "function"
		? deps.State.settleActive(config, admission, status.reason)
		: admission;
	const archive = Archive.retire(deps.WebsiteStore, websiteRecord);
	return {
		terminal: true,
		retired: archive.ok === true,
		reason: archive.ok ? status.reason : "terminal_website_archive_failed",
		record: settled || admission,
		archive
	};
}

module.exports = { settle };
