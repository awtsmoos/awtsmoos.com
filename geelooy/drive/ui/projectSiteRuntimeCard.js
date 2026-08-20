//B"H
// Boruch Hashem
// Blessed is He

import { SiteRuntimeClient } from "../transport/siteRuntimeClient.js";
import { createProjectSiteRuntimeView } from "./projectSiteRuntimeView.js";

/**
 * @file Stateful controller joining a project descriptor to its canonical Site runtime binding.
 * @description
 * The Awtsmoos lets one identity flow from Publish into living hosting while Awtsmoos.com refuses a second secret vocabulary;
 * the creator sees alias, Site, project, and attachment truth, while owner derivation remains beyond the browser vessel in protected light.
 */
export function createProjectSiteRuntimeCard(options = {}) {
	return new TiferesProjectSiteRuntimeCard(options);
}

class TiferesProjectSiteRuntimeCard {
	constructor(options) {
		this.client = options.client || new SiteRuntimeClient();
		this.project = null;
		this.state = emptyState();
		this.requestVersion = 0;
		this.view = createProjectSiteRuntimeView({
			attach: () => this.attach(),
			detach: () => this.detach()
		});
		this.view.render(this.state);
		this.element = this.view.element;
	}

	render(project) {
		this.project = project || null;
		const next = stateForProject(this.project, this.state);
		const identityChanged = next.identityKey !== this.state.identityKey;
		this.state = next;
		this.view.render(this.state);
		if (identityChanged && this.state.ready) {
			void this.refresh();
		}
		return this.element;
	}

	async refresh() {
		if (!this.state.ready) return;
		const version = ++this.requestVersion;
		try {
			const runtime = await this.client.status(this.identity());
			if (version !== this.requestVersion) return;
			this.state = runtimeState(this.state, runtime);
			this.view.render(this.state);
		} catch (error) {
			if (version === this.requestVersion) this.fail(error);
		}
	}

	async attach() {
		return this.mutate(() => this.client.attach({
			...this.identity(),
			projectId: this.state.projectId
		}));
	}

	async detach() {
		return this.mutate(() => this.client.detach(this.identity()));
	}

	async mutate(operation) {
		if (!this.state.ready || this.state.busy) return;
		this.state = { ...this.state, busy: true, error: "" };
		this.view.render(this.state);
		try {
			this.state = runtimeState(this.state, await operation());
		} catch (error) {
			this.fail(error);
		}
		this.view.render(this.state);
	}

	identity() {
		return { aliasId: this.state.aliasId, siteId: this.state.siteId };
	}

	fail(error) {
		this.state = { ...this.state, busy: false, error: error?.message || "Could not update Site runtime." };
		this.view.render(this.state);
	}
}

function emptyState() {
	return { ready: false, busy: false, attached: false, aliasId: "", siteId: "", projectId: "", attachedProjectId: "", identityKey: "", error: "" };
}

function stateForProject(project, previous) {
	const aliasId = String(project?.canonicalAliasId || "");
	const siteId = String(project?.canonicalSiteId || "");
	const projectId = String(project?.name || project?.rootPath || "geelooy-project");
	const identityKey = `${aliasId}|${siteId}|${projectId}`;
	return { ...previous, aliasId, siteId, projectId, identityKey, ready: Boolean(aliasId && siteId), attached: identityKey === previous.identityKey ? previous.attached : false, attachedProjectId: identityKey === previous.identityKey ? previous.attachedProjectId : "", error: "" };
}

function runtimeState(state, runtime) {
	return { ...state, busy: false, attached: Boolean(runtime?.attached), attachedProjectId: String(runtime?.source?.projectId || ""), error: "" };
}
