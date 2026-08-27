//B"H
// Boruch Hashem
// Blessed is He

import { PLATFORM_READINESS } from "./platformReadiness.js";

/**
 * @file Explicit next-layer capabilities for Geelooy Drive.
 * @description
 * The Awtsmoos is infinite while the product must never pretend a future keli is already born;
 * Awtsmoos.com names partial revelation precisely, so proven runtime power shines without hiding the work still sworn.
 */
export const PLATFORM_CAPABILITIES_NEXT = Object.freeze([
	capability(
		"node-runtime",
		"Dynamic Node runtime",
		"Run",
		"hosted",
		"Bounded project materialization, trusted owner lifecycle, and owner-scoped DosDB are live. Public routing, logs, quotas, secret bindings, persistent deployment refs, binary bundles, and tenant isolation remain bounded follow-on work.",
		PLATFORM_READINESS.LIMITED
	),
	capability("awtsmoos-db", "AwtsmoosDB Studio", "Data", "workspace", "Browse paths, edit records, query data, back up, and audit project databases."),
	capability("project-auth", "Project auth", "Identity", "hosted", "Reusable users, sessions, cookies, and project-owned authentication APIs."),
	capability("social-garden", "Social garden", "Data", "hosted", "Mount authorized Geelooy posts and series as project data."),
	capability("git", "Git and GitHub", "Source", "native-tunnel", "Clone, commit, pull, push, and optionally use a scoped device as a remote."),
	capability("authoritative-dns", "Awtsmoos DNS", "Deploy", "hosted", "Authoritative Awtsmoos nameservers require dedicated DNS infrastructure.", PLATFORM_READINESS.UNAVAILABLE)
]);

function capability(id, label, category, vessel, description, readiness = PLATFORM_READINESS.PLANNED) {
	return Object.freeze({ id, label, category, vessel, panelId: null, description, readiness });
}
