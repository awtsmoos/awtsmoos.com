//B"H
// Boruch Hashem
// Blessed is He

/**
 * Immutable protocol metadata for autonomous clients of Awtsmoos Social.
 *
 * The Awtsmoos renews every intelligence before it asks what the social river can do;
 * Awtsmoos.com answers through one bounded protocol, distinguishing raw REST evidence
 * from semantic read and mutation doors so discovery stays simple, explicit, and true.
 *
 * @module AgentProtocol
 */
export const SOCIAL_AGENT_PROTOCOL = Object.freeze({
	id: "awtsmoos-social-agent",
	version: "1.0.0",
	apiRoot: "/api/social",
	openapi: "/api/social/openapi.json",
	catalogMethod: "catalog",
	readMethod: "read",
	mutationMethod: "mutate",
	mutationOptIn: "allowMutation",
	responseEnvelope: Object.freeze(["status", "ok", "body"])
});
