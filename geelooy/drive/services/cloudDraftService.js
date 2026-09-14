//B"H
//Boruch Hashem
//Blessed be He

import { YesodProjectBundleService } from "./projectBundleService.js";
import { CLOUD_SOURCE_LIMITS, cloudOperationId } from "./cloudPublishPolicy.js";

/**
 * @file Private Browser/OS/Tunnel-to-Awtsmoos-Cloud draft migration.
 * @description The Awtsmoos copies one bounded source tree into a fresh owner-scoped
 * private project root; Awtsmoos.com never publishes this transfer and writes its
 * completion witness only after every project file has crossed successfully.
 */
export class CloudDraftService {
	constructor({ transport, state, client, bundleService } = {}) {
		this.state = state;
		this.client = client;
		this.bundleService = bundleService
			|| new YesodProjectBundleService(transport, CLOUD_SOURCE_LIMITS);
	}

	/** Saves the current workspace as one fresh private cloud project copy. */
	async save(input = {}) {
		const aliasId = required(input.aliasId, "CLOUD_ALIAS_REQUIRED");
		const snapshot = this.state.snapshot();
		const bundle = await this.bundleService.build({
			routeReference: snapshot.currentRoute,
			rootPath: snapshot.currentPath
		});
		if (!bundle.files.some(file => file.path === "index.html")) {
			throw draftError("CLOUD_INDEX_REQUIRED");
		}
		const projectId = projectSlug(input.projectId || input.title || "project");
		const rootPath = `projects/${projectId}-${operationSuffix()}`;
		await writeSource(this.client, aliasId, rootPath, bundle.files);
		await this.client.write(aliasId, `${rootPath}/.awtsmoos-cloud-project.json`, marker({
			aliasId,
			projectId,
			rootPath,
			sourceMode: snapshot.transportMode
		}));
		return Object.freeze({ aliasId, projectId, rootPath, fileCount: bundle.files.length });
	}
}

async function writeSource(client, aliasId, rootPath, files) {
	for (let index = 0; index < files.length; index += 4) {
		const batch = files.slice(index, index + 4);
		await Promise.all(batch.map(file => client.write(
			aliasId,
			`${rootPath}/${file.path}`,
			file.content
		)));
	}
}

function marker(value) {
	return JSON.stringify({
		BH: 'B"H',
		kind: "awtsmoos-cloud-project-v1",
		...value,
		savedAt: new Date().toISOString()
	}, null, "\t");
}

function operationSuffix() {
	return cloudOperationId().replace(/^builder-/, "").replace(/[^a-z0-9]+/gi, "").slice(-10).toLowerCase();
}

function projectSlug(value) {
	return String(value || "project")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48)
		.replace(/-+$/g, "") || "project";
}

function required(value, code) {
	const text = String(value || "").trim();
	if (!text) throw draftError(code);
	return text;
}

function draftError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
