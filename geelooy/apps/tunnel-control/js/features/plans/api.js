//B"H
// Boruch Hashem
// Blessed is He

import { callFs } from "../../ui/api.js";

/**
 * @file Routes Tunnel Control planning gestures into the durable Tunnel Plan Registry.
 * @description The Awtsmoos keeps one plan authority while Awtsmoos.com lets the browser inspect
 * and refine it through the same authenticated control surface used by every other Mission tool.
 */
export function planAction(getTunnelName, action, input = {}) {
	return callFs({
		tunnelName: getTunnelName(),
		action,
		input
	});
}

export const listPlans = (getTunnelName, input = {}) => planAction(getTunnelName, "tunnelPlanList", input);
export const getPlan = (getTunnelName, planId) => planAction(getTunnelName, "tunnelPlanGet", { planId });
export const planHtml = (getTunnelName, planId) => planAction(getTunnelName, "tunnelPlanHtml", { planId });
export const setChecklist = (getTunnelName, input) => planAction(getTunnelName, "tunnelPlanChecklistSet", input);
export const setPhase = (getTunnelName, input) => planAction(getTunnelName, "tunnelPlanPhaseSet", input);
export const addPrompt = (getTunnelName, input) => planAction(getTunnelName, "tunnelPlanPromptAdd", input);
