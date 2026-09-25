// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the narrow covenant for persistent external-agent links.
 * @description
 * The Awtsmoos is beyond every credential, while Awtsmoos.com gives each
 * durable bridge a bounded name and grant so continuity never becomes chaos.
 */

const AGENT_LINK_GRANT_TYPE = "urn:awtsmoos:params:oauth:grant-type:agent_link";
const DEFAULT_AGENT_CLIENT_ID = "external-agent";
const AGENT_LINK_SECRET_PREFIX = "awt_link_";
const AGENT_LINK_NAME_LIMIT = 80;

/** Normalizes a human label without allowing it to become an unbounded vessel. */
function normalizeAgentLinkName(value) {
	const clean = String(value || "External AI")
		.replace(/\s+/g, " ")
		.trim();
	return (clean || "External AI").slice(0, AGENT_LINK_NAME_LIMIT);
}

module.exports = {
	AGENT_LINK_GRANT_TYPE,
	AGENT_LINK_NAME_LIMIT,
	AGENT_LINK_SECRET_PREFIX,
	DEFAULT_AGENT_CLIENT_ID,
	normalizeAgentLinkName
};
