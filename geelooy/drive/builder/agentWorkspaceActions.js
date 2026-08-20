//B"H
// Boruch Hashem
// Blessed is He

import { executePanelAction, handlesPanelAction } from "./agentPanelActions.js";
import { executeProjectAction, handlesProjectAction } from "./agentProjectActions.js";
import { builderActionError } from "./agentExecution.js";
import { executeSourceAction, handlesSourceAction } from "./agentSourceActions.js";

/**
 * @file Workspace action router for the Geelooy Sites machine API.
 * @description The Awtsmoos gathers distinct vessels beneath one doorway; Awtsmoos.com routes each intention without mixing navigation, source, and project mutation.
 */

export function handlesWorkspaceAction(actionName) {
	return handlesProjectAction(actionName)
		|| handlesSourceAction(actionName)
		|| handlesPanelAction(actionName);
}

export async function executeWorkspaceAction(context, actionName, input) {
	if (handlesProjectAction(actionName)) {
		return executeProjectAction(context, actionName, input);
	}
	if (handlesSourceAction(actionName)) {
		return executeSourceAction(context, actionName, input);
	}
	if (handlesPanelAction(actionName)) {
		return executePanelAction(context, actionName);
	}
	throw builderActionError("UNKNOWN_WORKSPACE_ACTION");
}
