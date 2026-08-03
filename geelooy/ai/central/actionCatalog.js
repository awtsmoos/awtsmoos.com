// B"H
import { GENERATED_TUNNEL_ACTIONS } from "./generatedTunnelActions.js";

/**
 * B"H
 * Chapter 390: The Generated Scroll Became The Agent's Tool Crown.
 *
 * The default council includes both provider delegates and authenticated
 * ChatGPT website missions.  Keeping the website mission family in this list
 * makes its start/status/room controls visible to every local and endpoint
 * agent instead of hiding the only multi-agent path behind generic discovery.
 */
export const ALL_TUNNEL_ACTIONS = Object.freeze(
	[...new Set(GENERATED_TUNNEL_ACTIONS)].sort((a, b) => a.localeCompare(b))
);

export const AI_AGENT_ACTIONS = Object.freeze(ALL_TUNNEL_ACTIONS.filter(action =>
	action === "agent" ||
	action.startsWith("aiAgent") ||
	action.startsWith("websiteAgentMission") ||
	action === "chatgptWebsiteLogout"
));

export function allTunnelActions() {
	return [...ALL_TUNNEL_ACTIONS];
}

export function aiAgentActions() {
	return [...AI_AGENT_ACTIONS];
}
