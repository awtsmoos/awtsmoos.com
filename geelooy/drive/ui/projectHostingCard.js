//B"H
// Boruch Hashem
// Blessed is He

import { NetzachProjectHostingService } from "../services/projectHostingService.js";
import { createHostingCardShell, renderHostingError, renderHostingLoading, renderHostingPlan } from "./projectHostingCardView.js";
import { allowRuntimeAction } from "./projectRuntimeActionGuard.js";
import { createProjectRuntimeControls } from "./projectHostingRuntimeView.js";
import { actionRuntimeState, activityRuntimeState, emptyRuntimeState, statusRuntimeState } from "./projectHostingRuntimeState.js";

/**
 * @file Stateful controller joining hosting readiness, runtime truth, bounded activity, and native-dialog consent.
 * @description
 * The Awtsmoos renews source, vessel, motion, and trace without confusing their names;
 * Awtsmoos.com lets Health recover durable truth while Cleanup awaits an injected Drive dialog before dissolving its server-side vessel.
 */
export function createProjectHostingCard(options = {}) {
	return new TiferesProjectHostingCard(options);
}

class TiferesProjectHostingCard {
	constructor(options) {
		this.service = options.hostingService || new NetzachProjectHostingService();
		this.deployment = options.deploymentService || null;
		this.confirmRuntimeCleanup = options.confirmRuntimeCleanup || null;
		this.project = null;
		this.routeReference = "";
		this.projectKey = "";
		this.requestVersion = 0;
		this.runtimeState = emptyRuntimeState();
		const shell = createHostingCardShell(() => this.refresh());
		this.element = shell.element;
		this.status = shell.status;
		this.body = shell.body;
		this.exposure = shell.exposure;
		this.runtime = createProjectRuntimeControls(action => this.runRuntime(action));
		this.runtime.render(this.runtimeState);
		this.element.append(this.runtime.element);
	}

	render(project, context = {}) {
		this.project = project || null;
		this.routeReference = String(context.routeReference || "");
		const nextKey = `${project?.name || ""}|${project?.rootPath || "."}|${this.routeReference}`;
		if (nextKey !== this.projectKey) {
			this.projectKey = nextKey;
			this.runtimeState = emptyRuntimeState();
			this.runtime.render(this.runtimeState);
			void this.refresh();
			void this.syncRuntimeStatus();
		}
		return this.element;
	}

	async refresh() {
		if (!this.project) return;
		const requestVersion = ++this.requestVersion;
		renderHostingLoading(this.status, this.body);
		try {
			const plan = await this.service.buildPlan({
				projectId: this.project.name || this.project.rootPath || "geelooy-project",
				rootPath: this.project.rootPath || ".",
				exposure: this.exposure.value
			});
			if (requestVersion === this.requestVersion) renderHostingPlan(this.status, this.body, plan);
		} catch (error) {
			if (requestVersion === this.requestVersion) renderHostingError(this.status, this.body, error);
		}
	}

	async syncRuntimeStatus() {
		if (!this.deployment || !this.project) return;
		try {
			this.runtimeState = statusRuntimeState(await this.deployment.status(this.project), this.runtimeState);
			this.runtime.render(this.runtimeState);
		} catch (error) {
			this.renderRuntimeError(error?.message || "Could not read project runtime status.");
		}
	}

	async runRuntime(action) {
		if (!this.deployment || !this.project) return this.renderRuntimeError("Trusted runtime controls are not connected to this workspace.");
		if (!await allowRuntimeAction(action, this.confirmRuntimeCleanup)) {
			return;
		}
		this.runtimeState = { ...this.runtimeState, busy: true, error: "" };
		this.runtime.render(this.runtimeState);
		try {
			const result = await this.executeRuntimeAction(action);
			this.runtimeState = this.nextRuntimeState(action, result);
			this.runtime.render(this.runtimeState);
		} catch (error) {
			this.renderRuntimeError(error?.message || "Project runtime action failed.");
		}
	}

	nextRuntimeState(action, result) {
		if (action === "status") return statusRuntimeState(result, this.runtimeState);
		if (action === "activity") return activityRuntimeState(result, this.runtimeState);
		return actionRuntimeState(action, result, this.runtimeState, this.deployment.isMaterialized(this.project));
	}

	executeRuntimeAction(action) {
		if (action === "materialize") return this.deployment.materialize({ project: this.project, routeReference: this.routeReference });
		if (["status", "activity", "start", "restart", "stop", "cleanup"].includes(action)) return this.deployment[action](this.project);
		throw new Error(`Unknown project runtime action: ${action}`);
	}

	renderRuntimeError(message) {
		this.runtimeState = { ...this.runtimeState, busy: false, error: message };
		this.runtime.render(this.runtimeState);
	}
}
