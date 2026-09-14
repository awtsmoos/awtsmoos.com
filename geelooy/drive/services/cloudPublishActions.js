//B"H
//Boruch Hashem
//Blessed be He

import { CloudDraftService } from "./cloudDraftService.js";
import { CloudPublishService } from "./cloudPublishService.js";
import { CloudPublishClient } from "../transport/cloudPublishClient.js";
import { CloudWorkspaceClient } from "../transport/cloudWorkspaceClient.js";

/**
 * @file Human action surface for universal Awtsmoos Cloud publication.
 * @description The Awtsmoos binds one reusable publication service to the Builder action map while Awtsmoos.com keeps network and bundle orchestration outside UI components.
 */
export function createCloudPublishActions(options = {}) {
	const client = options.cloudPublishClient || new CloudPublishClient();
	const service = options.cloudPublishService || new CloudPublishService({
		transport: options.transport,
		state: options.state,
		client,
		canonicalSite: options.canonicalSite
	});
	const draftService = options.cloudDraftService || new CloudDraftService({
		transport: options.transport,
		state: options.state,
		client: options.cloudWorkspaceClient || new CloudWorkspaceClient()
	});
	return Object.freeze({
		loadCloudAliases: () => service.aliases(),
		saveCloudDraft: input => saveDraft(draftService, options.state, input),
		publishToCloud: input => publish(service, options.state, input)
	});
}

async function publish(service, state, input) {
	state.patch({ error: "", message: "Publishing immutable Awtsmoos Cloud revision…" });
	try {
		const result = await service.publish(input);
		state.patch({
			error: "",
			message: `Published ${result.publicUrl}`
		});
		return result;
	} catch (error) {
		state.patch({ error: publishMessage(error), message: "" });
		return false;
	}
}

function publishMessage(error) {
	const code = String(error?.code || "");
	if (code === "CLOUD_ALIAS_REQUIRED") return "Choose an Awtsmoos alias before publishing.";
	if (code === "CLOUD_INDEX_REQUIRED") return "Add index.html before publishing this Site.";
	if (code.includes("AUTH") || code.includes("LOGIN")) return "Sign in to Awtsmoos before publishing to Cloud.";
	if (code.includes("SCOPE") || code.includes("AUTHORIZED")) return "This account does not have publication authority for that alias.";
	return "Awtsmoos Cloud publication did not complete. The existing public revision was not replaced.";
}

async function saveDraft(service, state, input) {
	state.patch({ error: "", message: "Saving a private Awtsmoos Cloud copy…" });
	try {
		const result = await service.save(input);
		state.patch({ error: "", message: `Private Cloud copy saved at ${result.rootPath}` });
		return result;
	} catch (error) {
		state.patch({ error: publishMessage(error), message: "" });
		return false;
	}
}
