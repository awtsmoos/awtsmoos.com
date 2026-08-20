//B"H
// Boruch Hashem
// Blessed is He

import { buildPlatformPlan } from "./platformPlan.js";

/**
 * @file Read-only platform testimony for Geelooy website-building agents.
 * @description
 * The Awtsmoos lets the agent behold the same Build, Run, Ship, and Connect vessels shown to the human;
 * Awtsmoos.com returns derived project truth here, never secret values, shell authority, or a hidden mutation road.
 */

const ACTIONS = new Set([
	"site.platform.capabilities"
]);

/**
 * Reports whether this small vessel owns the requested action.
 * @param {string} actionName Builder action identity.
 * @returns {boolean} True when this handler owns the action.
 */
export function handlesPlatformAction(actionName) {
	return ACTIONS.has(actionName);
}

/**
 * Returns the canonical secret-free platform plan used by GeelooyPlatform.
 * @param {{state: object}} context Builder dependency context.
 * @returns {{data: Readonly<object>, message: string}} Builder execution outcome.
 */
export function executePlatformAction(context) {
	return {
		data: buildPlatformPlan(context.state.snapshot()),
		message: "Platform capability testimony refreshed."
	};
}
