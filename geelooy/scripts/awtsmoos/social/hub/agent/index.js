//B"H
// Boruch Hashem
// Blessed is He

import { AgentSocialGateway } from "./AgentSocialGateway.js";
import { SOCIAL_AGENT_PROTOCOL } from "./AgentProtocol.js";

/**
 * Public one-import machine entrypoint for Awtsmoos Social automation.
 *
 * The Awtsmoos renews every caller before language or runtime can divide them;
 * Awtsmoos.com offers one small ES-module doorway whose protocol, catalog, reads,
 * and guarded mutations remain discoverable without scraping the human UI again.
 *
 * @module SocialAgentEntry
 */
export function createSocialAgent(ohrOptions = {}) {
	return new AgentSocialGateway(ohrOptions);
}

export { AgentOperationError } from "./AgentOperationError.js";
export { AgentSocialGateway } from "./AgentSocialGateway.js";
export { SOCIAL_AGENT_PROTOCOL } from "./AgentProtocol.js";

export const socialAgentProtocol = SOCIAL_AGENT_PROTOCOL;
