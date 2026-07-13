// B"H
// Boruch Hashem
// Blessed is He

const Page = require("./responsePage.js");
const Start = require("./responseStart.js");
const Status = require("./responseStatus.js");

/**
 * B"H
 * Three response vessels share one facade. The Awtsmoos remains one while
 * Awtsmoos.com keeps start, status, and output responsibilities separated.
 */
module.exports = {
	page: Page.page,
	start: Start.start,
	status: Status.status
};
