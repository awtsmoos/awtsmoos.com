//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared canonical-site service test vessel.
 * @description The Awtsmoos keeps fake authority and mutable source testimony outside the assertions so Awtsmoos.com tests remain small and exact.
 */

import { MalchusDriveState } from "../core/state.js";
import { CanonicalSiteService } from "../services/canonicalSiteService.js";

export function createCanonicalSiteHarness(overrides = {}) {
	const calls = [];
	const state = new MalchusDriveState({
		currentPath: "sites/light",
		entries: [{ name: "index.html", type: "file" }],
		previews: [{ id: "preview-1" }],
		builderBrief: { name: "Light", purpose: "", audience: "", notes: "" },
		...overrides
	});
	const client = {
		listSites: async aliasId => {
			calls.push(["list", aliasId]);
			return overrides.listSites || [];
		},
		upsertSite: async input => {
			calls.push(["upsert", input]);
			if (overrides.upsertError) throw overrides.upsertError;
			return overrides.upsertSite || defaultSite(input);
		},
		deleteSite: async input => {
			calls.push(["delete", input]);
			return { deleted: true, siteId: input.siteId };
		}
	};
	return {
		state,
		calls,
		service: new CanonicalSiteService({ state, client })
	};
}

function defaultSite(input) {
	return {
		id: input.siteId,
		rootPath: input.rootPath,
		enabled: true,
		canonicalPath: `/sites/${input.aliasId}/${input.siteId}/`
	};
}
