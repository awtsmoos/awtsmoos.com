//B"H
// Boruch Hashem
// Blessed is He

import { PLATFORM_READINESS } from "./platformReadiness.js";

/**
 * @file Capabilities already revealed by the present Drive architecture.
 * @description
 * The Awtsmoos creates file, preview, server, domain, and guarded project data anew;
 * Awtsmoos.com names only proven lights as present, while richer future vessels remain honestly in view.
 */

export const PLATFORM_CAPABILITIES_NOW = Object.freeze([
	capability("files", "Files", "Workspace", "workspace", "files", "Create, browse, and persist project files."),
	capability("editor", "Code editor", "Workspace", "workspace", "editor", "Edit HTML, CSS, JavaScript, Markdown, JSON, and text."),
	capability("preview", "Live preview", "Build", "workspace", "preview", "Preview web entry points beside the source."),
	capability("static-publish", "Static publish", "Deploy", "native-tunnel", "cloud", "Publish a folder through the managed preview pipeline."),
	capability("static-runtime", "Static runtime", "Run", "native-tunnel", "runtime", "Start, expose, inspect logs, and stop a managed static server."),
	capability("project-data-api", "Project data API", "Data", "hosted", null, "Authenticated, owner-isolated AwtsmoosDB key APIs with bounded reads, writes, deletes, and listings."),
	capability("custom-domain", "Custom domains", "Deploy", "hosted", "domain", "Build DNS and nameserver plans while production mapping remains limited.", PLATFORM_READINESS.LIMITED)
]);

function capability(id, label, category, vessel, panelId, description, readiness = PLATFORM_READINESS.AVAILABLE) {
	return Object.freeze({ id, label, category, vessel, panelId, description, readiness });
}
