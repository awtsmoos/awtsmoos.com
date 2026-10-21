//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkRoutes
 * @description
 * B"H — "What needs work on my posts?" for tunnel-connected AI agents.
 *
 * GET /api/social/posts/needsWork
 *   Full report for the authenticated account: every owned alias, organized
 *   alias -> heichel/series -> post, with gap counts and priorities.
 * GET /api/social/aliases/:alias/postsMade/needsWork
 *   Same report scoped to one alias (must belong to the requester).
 *
 * Gap types covered:
 *   missing_translation, missing_phrase_translations, missing_summaries,
 *   missing_footnotes, missing_page_markers, broken_page_markers,
 *   no_alias_link, empty_alias_link, submitted_unapproved.
 *
 * Reads AwtsmoosDB natively on production ($i.db). Never touches the repo.
 * Hebrew bytes are only read, never written or normalized.
 *
 * Query params:
 *   limit (default 400, max 2000) — max post records scanned per alias
 *   heichel — restrict to one heichel id
 *   series — restrict to one series id
 *   gaps — comma list to include (default: all)
 *   summaryOnly — 1 to skip per-post items, keep counts only
 */

const { sp, NO_LOGIN } = require('../../_awtsmoos.constants.js');
const { loggedIn, er, myOpts } = require("../../general.js");
const { GAP_PRIORITY, GAP_LABEL } = require('./needsWorkConstants.js');
const { collectText, countPageMarkers } = require('./needsWorkText.js');
const { detectPostGaps } = require('./needsWorkDetect.js');
const { parseOptions, buildAccountReport } = require('./needsWorkReport.js');

function createNeedsWorkRoutes({ $i, userid }) {
	return {
		"/posts/needsWork": async () => {
			if (!loggedIn($i)) return er(NO_LOGIN);
			if ($i.request.method !== "GET") {
				return er({ code: "METHOD_NOT_ALLOWED", message: "Use GET." });
			}
			return buildAccountReport($i, userid, parseOptions($i));
		},
		"/aliases/:alias/postsMade/needsWork": async vars => {
			if (!loggedIn($i)) return er(NO_LOGIN);
			if ($i.request.method !== "GET") {
				return er({ code: "METHOD_NOT_ALLOWED", message: "Use GET." });
			}
			return buildAccountReport($i, userid, parseOptions($i), vars.alias);
		}
	};
}

module.exports = {
	createNeedsWorkRoutes,
	// Exported for unit tests.
	detectPostGaps,
	collectText,
	countPageMarkers,
	GAP_PRIORITY,
	GAP_LABEL
};
