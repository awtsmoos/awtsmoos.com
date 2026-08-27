//B"H
// Boruch Hashem
// Blessed is He

import { builderAgentAction, builderAgentActions } from "./agentActions.js";
import { executeCanonicalAction, handlesCanonicalAction } from "./agentCanonicalActions.js";
import { executeDomainAction, handlesDomainAction } from "./agentDomainActions.js";
import { executePlatformAction, handlesPlatformAction } from "./agentPlatformActions.js";
import { executePublishingAction, handlesPublishingAction } from "./agentPublishingActions.js";
import { builderFailure, builderSuccess } from "./agentResult.js";
import { executeWorkspaceAction, handlesWorkspaceAction } from "./agentWorkspaceActions.js";
import { describeWebsiteProject } from "./projectDescriptor.js";

/**
 * @file Public in-page facade for DIY website-building agents.
 * @description
 * The Awtsmoos gathers project vessels beneath one address while every authority remains distinct;
 * Awtsmoos.com gives machine callers the exact human canonical and domain services, never second fetch paths or hidden credentials.
 */

export class GeelooyWebsiteBuilderApi {
	constructor({ state, workspace, panels, canonicalSite = null, domainClaims = null }) {
		this.context = { state, workspace, panels, canonicalSite, domainClaims };
	}

	capabilities() {
		return builderAgentActions();
	}

	snapshot() {
		return describeWebsiteProject(this.context.state.snapshot());
	}

	async run(actionName, input = {}) {
		if (!builderAgentAction(actionName)) return builderFailure(actionName, "UNKNOWN_BUILDER_ACTION");
		try {
			const result = await this.execute(actionName, input);
			return builderSuccess(actionName, result.data, result.message);
		} catch (error) {
			return builderFailure(actionName, error?.code || "BUILDER_ACTION_FAILED", error?.message);
		}
	}

	async execute(actionName, input) {
		if (handlesPlatformAction(actionName)) return executePlatformAction(this.context, actionName, input);
		if (handlesWorkspaceAction(actionName)) return executeWorkspaceAction(this.context, actionName, input);
		if (handlesCanonicalAction(actionName)) return executeCanonicalAction(this.context, actionName, input);
		if (handlesDomainAction(actionName)) return executeDomainAction(this.context, actionName, input);
		if (handlesPublishingAction(actionName)) return executePublishingAction(this.context, actionName, input);
		throw unknownActionError();
	}
}

export function installWebsiteBuilderApi(api, browserWindow = globalThis) {
	browserWindow.GeelooySiteBuilder = api;
	browserWindow.dispatchEvent?.(new CustomEvent(
		"geelooy-site-builder-ready",
		{ detail: { version: 2 } }
	));
	return api;
}

function unknownActionError() {
	const error = new Error("UNKNOWN_BUILDER_ACTION");
	error.code = "UNKNOWN_BUILDER_ACTION";
	return error;
}
