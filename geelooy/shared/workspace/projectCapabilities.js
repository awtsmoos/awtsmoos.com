//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Shared Geelooy project capability vocabulary.
 * @description
 * The Awtsmoos renews one project through many vessels without breaking its name;
 * Awtsmoos.com lets OS, Drive, Code, Tunnel, and APIs speak one language of creation and flame.
 */

export const PROJECT_CAPABILITY_STAGES = Object.freeze([
	"build",
	"run",
	"ship",
	"connect"
]);

export const PROJECT_CAPABILITIES = Object.freeze([
	capability("files", "Files", "\u{1F5C2}\uFE0F", "build", "Own and organize the project filesystem."),
	capability("code", "Code", "\u{1F9EC}", "build", "Edit project source with the shared workspace."),
	capability("preview", "Preview", "\u{1F52D}", "build", "Render the project before it becomes public."),
	capability("runtime", "Runtime", "\u26A1", "run", "Run bounded Node-style project processes and inspect health."),
	capability("database", "Database", "\u{1F5C3}\uFE0F", "run", "Store and inspect project data through AwtsmoosDB."),
	capability("auth", "Auth", "\u{1FAAA}", "run", "Compose identity, sessions, cookies, and access policy."),
	capability("publish", "Publish", "\u{1F680}", "ship", "Expose static folders or dynamic runtimes through stable routes."),
	capability("domains", "Domains", "\u{1F30D}", "ship", "Attach paths, subdomains, and verified custom domains."),
	capability("git", "Git", "\u{1F33F}", "connect", "Track history and synchronize repositories while preserving ownership."),
	capability("tunnel", "Tunnel", "\u{1F309}", "connect", "Bridge selected local devices, folders, and runtimes into the project."),
	capability("social", "Social", "\u{1FAC2}", "connect", "Connect Geelooy aliases, posts, series, and social identity.")
]);

/**
 * Finds one immutable project capability by stable identifier.
 * @param {string} id Stable capability identifier.
 * @returns {Readonly<object>|null} Matching capability or null.
 */
export function projectCapabilityById(id) {
	return PROJECT_CAPABILITIES.find(item => item.id === id) || null;
}

/**
 * Returns the capabilities belonging to one user-journey stage.
 * @param {string} stage Build, run, ship, or connect.
 * @returns {Readonly<object>[]} Matching capabilities in display order.
 */
export function projectCapabilitiesForStage(stage) {
	return PROJECT_CAPABILITIES.filter(item => item.stage === stage);
}

function capability(id, title, icon, stage, description) {
	return Object.freeze({
		id,
		title,
		icon,
		stage,
		description
	});
}
