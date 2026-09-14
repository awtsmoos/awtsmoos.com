//B"H
//Boruch Hashem
//Blessed be He

import { YesodProjectBundleService } from "./projectBundleService.js";
import {
	activeDeploymentId,
	CLOUD_SOURCE_LIMITS,
	cloudIdentity,
	cloudOperationId,
	sourceVessel
} from "./cloudPublishPolicy.js";
import { prepareCloudSourceFiles } from "./cloudPublishLineage.js";
import { remixReceiptFromFiles } from "./cloudPublishReceipt.js";

/**
 * @file Universal Builder-to-Awtsmoos-Cloud publication coordinator.
 * @description The Awtsmoos gathers bounded text source from Browser, OS, or Tunnel workspaces while Awtsmoos.com preserves the currently visible revision until a new immutable deployment is proven ready.
 */
export class CloudPublishService {
	constructor({ transport, state, client, canonicalSite, bundleService } = {}) {
		this.state = state;
		this.client = client;
		this.canonicalSite = canonicalSite;
		this.bundleService = bundleService
			|| new YesodProjectBundleService(transport, CLOUD_SOURCE_LIMITS);
	}

	/** Returns aliases already owned by the signed-in account. */
	aliases() {
		return this.client.aliases();
	}

	/** Promotes the current workspace folder into one immutable public Site revision. */
	async publish(input = {}) {
		const identity = cloudIdentity(input);
		const snapshot = this.state.snapshot();
		const bundle = await this.bundleService.build({
			routeReference: snapshot.currentRoute,
			rootPath: snapshot.currentPath
		});
		const remixReceipt = remixReceiptFromFiles(bundle.files);
		const files = prepareCloudSourceFiles(bundle.files, identity);
		if (!files.some(file => file.path === "index.html")) {
			throw publishError("CLOUD_INDEX_REQUIRED");
		}
		const existing = await this.existingSite(identity);
		const stable = await this.freezeMutableSite(existing, identity);
		const rootPath = `sites/${identity.siteId}`;
		const bootstrap = await this.client.bootstrap({
			...identity,
			rootPath,
			files,
			enabled: Boolean(stable?.enabled),
			sourceVessel: sourceVessel(snapshot.transportMode),
			remixReceipt
		});
		const observedDeploymentId = activeDeploymentId(bootstrap?.site)
			|| activeDeploymentId(stable);
		const deployment = await this.client.deploy({
			...identity,
			rootPath,
			expectedDeploymentId: observedDeploymentId,
			idempotencyKey: cloudOperationId(),
			message: `Published ${identity.title} from Geelooy Sites`
		});
		let site = deployment?.site || bootstrap?.site;
		if (!site?.enabled) {
			site = await this.client.enableSite({ ...identity, rootPath });
		}
		await this.refreshCanonical(identity);
		return publicationResult(identity, rootPath, deployment, site);
	}

	async existingSite(identity) {
		const sites = await this.client.listSites(identity.aliasId);
		return sites.find(site => site.id === identity.siteId && !site.implicit) || null;
	}

	async freezeMutableSite(site, identity) {
		if (!site?.enabled || site.source?.kind === "drive-deployment") return site;
		const frozen = await this.client.deploy({
			...identity,
			rootPath: site.rootPath || "",
			expectedDeploymentId: null,
			idempotencyKey: cloudOperationId(),
			message: "Freeze mutable Site before immutable republish"
		});
		return frozen?.site || site;
	}

	async refreshCanonical(identity) {
		if (!this.canonicalSite) return;
		this.canonicalSite.setTarget(identity);
		await this.canonicalSite.refresh();
	}
}

function publicationResult(identity, rootPath, deployment, site) {
	return Object.freeze({
		...identity,
		rootPath,
		deployment: deployment?.deployment || null,
		site,
		publicUrl: `/sites/${encodeURIComponent(identity.aliasId)}/${encodeURIComponent(identity.siteId)}/`
	});
}

function publishError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
