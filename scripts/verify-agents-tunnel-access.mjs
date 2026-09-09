// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import { ALL_TUNNEL_ACTIONS } from "../geelooy/ai/central/actionCatalog.js";
import { GENERATED_TUNNEL_ACTIONS } from "../geelooy/ai/central/generatedTunnelActions.js";
import Surface from "../geelooy/apps/tunnel/agent/lib/public-action-surface.js";
import Catalog from "../geelooy/apps/tunnel/agent/lib/local-api-catalog.js";
import Resolver from "../geelooy/api/tunnel/control/routes/fsVessel/publicActionResolver.js";
import {
	ALL_RUNTIME_ACTIONS,
	SAFE_ACTIONS,
	VIRTUAL_ACTIONS,
	actionCapability,
	buildToolManifest
} from "../geelooy/shared/awtsmoos-runtime/index.js";

/**
 * @file Verifies the compact Tunnel capability surface without pretending inner operations are public tools.
 * @description The Awtsmoos keeps fourteen stable doors above a larger guarded runtime. Awtsmoos.com therefore proves catalog unity, safe/virtual
 * fallbacks, exact-operation resolution, and family rejection while leaving internal registry growth discoverable instead of exploding the public crown.
 */
const requiredPublic = Object.freeze([
	"agent", "batch", "browser", "command", "files", "git", "mission",
	"preview", "recover", "runtime", "status", "system", "test", "web"
]);
const failures = [];

function requireTrue(value, label) {
	if (!value) failures.push(label);
}

function sameNames(first, second) {
	return [...first].sort().join("\n") === [...second].sort().join("\n");
}

const runtimeManifest = buildToolManifest();
const publicCatalog = Catalog.makeCatalog({ root: process.cwd() }, "verify");
const resolverManifest = {
	fs: ["readFile"],
	command: ["shellRun"],
	chrome: ["browserClick"]
};
const resolved = Resolver.resolve(
	{ action: "files", operation: "readFile" },
	resolverManifest
);
const mismatched = Resolver.resolve(
	{ action: "browser", operation: "readFile" },
	resolverManifest
);

requireTrue(ALL_TUNNEL_ACTIONS.length === 14, "public tunnel catalog must stay compact at fourteen doors");
requireTrue(sameNames(ALL_TUNNEL_ACTIONS, GENERATED_TUNNEL_ACTIONS), "central and generated public catalogs must agree");
requireTrue(sameNames(ALL_TUNNEL_ACTIONS, Surface.PUBLIC_ACTIONS), "agent and installed public capability catalogs must agree");
requireTrue(sameNames(ALL_TUNNEL_ACTIONS, requiredPublic), "the fourteen documented capability doors must remain present");
requireTrue(requiredPublic.every((name) => ALL_RUNTIME_ACTIONS.includes(name)), "shared runtime must include every public capability");
requireTrue(SAFE_ACTIONS.every((name) => ALL_RUNTIME_ACTIONS.includes(name)), "shared runtime must include every safe direct action");
requireTrue(runtimeManifest.length === ALL_RUNTIME_ACTIONS.length, "shared tool manifest must describe the full runtime union");
requireTrue(runtimeManifest.every((tool) => ALL_RUNTIME_ACTIONS.includes(tool.name)), "shared tool manifest may not invent actions");
requireTrue(publicCatalog.publicActionCount === 14, "local API catalog must advertise fourteen public capabilities");
requireTrue(sameNames(publicCatalog.actions, requiredPublic), "local API catalog must advertise the canonical public doors");

requireTrue(actionCapability("read") === "virtual-compatible", "read must remain virtual-compatible");
requireTrue(actionCapability("command") === "live-tunnel-preferred", "command must prefer the live tunnel while retaining safe fallback");
requireTrue(actionCapability("agent") === "requires-live-tunnel", "agent capability must require richer live authority");
requireTrue(actionCapability("totallyFakeAction") === "unknown-action", "unknown actions must remain unknown");
requireTrue(VIRTUAL_ACTIONS.length > 0, "virtual fallback subset must remain available");
requireTrue(resolved.ok && resolved.compact, "compact resolver must accept a valid family operation");
requireTrue(resolved.payload?.action === "readFile", "compact resolver must reveal the exact execution action");
requireTrue(mismatched.ok === false, "compact resolver must reject cross-family execution");
requireTrue(mismatched.error === "compact_operation_family_mismatch", "cross-family rejection must stay explicit to the caller");

const fileChecks = [
	["geelooy/apps/tunnel/agent/lib/public-action-surface.js", ["fourteen public capabilities", "familyForOperation"]],
	["geelooy/apps/tunnel/agent/lib/local-api-catalog.js", ["publicActionCount", "internalActionCount"]],
	["geelooy/api/tunnel/control/routes/fsVessel/publicActionResolver.js", ["compact_operation_family_mismatch", "executionAction"]],
	["geelooy/ai/central/browserLocalTunnelCatalog.js", ["Discovery is dynamic", "mergeCatalogPayloads"]],
	["geelooy/shared/awtsmoos-runtime/actions.js", ["GENERATED_TUNNEL_ACTIONS", "SAFE_ACTIONS", "VIRTUAL_ACTIONS"]],
	["geelooy/shared/awtsmoos-runtime/agent-core.js", ["buildToolManifest", "routeAwtsmoosAction"]]
];
for (const [path, needles] of fileChecks) {
	const text = fs.readFileSync(path, "utf8");
	for (const needle of needles) {
		requireTrue(text.includes(needle), `${path} missing ${needle}`);
	}
}

const report = {
	ok: failures.length === 0,
	publicActionCount: ALL_TUNNEL_ACTIONS.length,
	runtimeActionCount: ALL_RUNTIME_ACTIONS.length,
	toolCount: runtimeManifest.length,
	safeCount: SAFE_ACTIONS.length,
	virtualCount: VIRTUAL_ACTIONS.length,
	internalActionCount: publicCatalog.internalActionCount,
	checkedFiles: fileChecks.length,
	failures
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
