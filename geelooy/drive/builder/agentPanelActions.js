//B"H
// Boruch Hashem
// Blessed is He

import { builderActionError, builderOutcome } from "./agentExecution.js";
import { describeWebsiteProject } from "./projectDescriptor.js";

/**
 * @file Read-only navigation actions for human-visible builder surfaces.
 * @description The Awtsmoos lets an agent point toward Files, Publish, or Domain while Awtsmoos.com keeps navigation separate from source mutation.
 */

const PANEL_ACTIONS = Object.freeze({
	"site.files.open": "files",
	"site.publish.open": "cloud",
	"site.domain.open": "domain"
});

export function handlesPanelAction(actionName) {
	return Boolean(PANEL_ACTIONS[actionName]);
}

export function executePanelAction(context, actionName) {
	const panelId = PANEL_ACTIONS[actionName];
	const opened = context.panels.open(panelId, {
		scroll: context.panels.isMobile()
	});
	if (!opened) {
		throw builderActionError("PANEL_OPEN_FAILED");
	}
	return builderOutcome({
		panelId,
		project: describeWebsiteProject(context.state.snapshot())
	});
}
