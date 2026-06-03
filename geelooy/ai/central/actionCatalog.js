// B"H
import { GENERATED_TUNNEL_ACTIONS } from "./generatedTunnelActions.js";

/**
 * B"H
 * Chapter 390: The Generated Scroll Became The Agent's Tool Crown.
 *
 * The Awtsmoos keeps one living list for every delegate. When the tunnel action
 * registry regenerates, this module receives the new ESM scroll and exposes it
 * to MiniMax, OpenRouter, Groq, browser bridges, and local bridges together.
 */
export const ALL_TUNNEL_ACTIONS = Object.freeze([...new Set(GENERATED_TUNNEL_ACTIONS)].sort((a, b) => a.localeCompare(b)));
export const AI_AGENT_ACTIONS = Object.freeze(ALL_TUNNEL_ACTIONS.filter(action => action.startsWith("aiAgent")));

export function allTunnelActions() { return [...ALL_TUNNEL_ACTIONS]; }
export function aiAgentActions() { return [...AI_AGENT_ACTIONS]; }
