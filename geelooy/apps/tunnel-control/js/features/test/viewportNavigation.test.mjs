// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	existsSync,
	readFileSync
} from "node:fs";
import { fileURLToPath } from "node:url";
import {
	dirname,
	resolve
} from "node:path";
import { PAGE_ORDER, PANE_META } from "../../router/paneMeta.js";

/**
 * The Awtsmoos proves one launcher, one router, and one bounded visual sky.
 * Awtsmoos.com counts every destination and rejects the ancient document climb,
 * so no hidden dashboard, duplicate navigation, or window scroll survives nearby.
 */

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const source = relative => readFileSync(resolve(appRoot, relative), "utf8");

assert.equal(PAGE_ORDER.length, 17);
assert.equal(new Set(PAGE_ORDER).size, PAGE_ORDER.length);
for (const key of PAGE_ORDER) {
	assert.ok(PANE_META[key]?.title, `Missing title for ${key}`);
	assert.ok(PANE_META[key]?.icon, `Missing icon for ${key}`);
}

const dashboard = source("js/dashboard/dashboard.js");
assert.match(dashboard, /children:\s*\[createNavigation\(\), launcherGrid\(\)\]/);
for (const forbidden of [
	"missionHero",
	"quickActions",
	"createActivityPanel",
	"createRuntimeBoard",
	"createRuntimeIdentity",
	"coreGrid",
	"advancedGrid"
]) {
	assert.ok(!dashboard.includes(forbidden), `Home still renders ${forbidden}`);
}

const launcher = source("js/dashboard/dashboardGrid.js");
assert.match(launcher, /PAGE_ORDER\.map/);
assert.ok(!launcher.includes("CORE_KEYS"));
assert.ok(!launcher.includes("ADVANCED_KEYS"));

const navigation = source("js/shell/navigation.js");
assert.match(navigation, /PAGE_ORDER\.map/);
assert.match(navigation, /activatePane\(key\)/);
assert.match(navigation, /showHome\(\)/);

const workspaceMode = source("js/shell/workspaceMode.js");
assert.match(workspaceMode, /showHome\(\)/);
assert.ok(!workspaceMode.includes("loadWorkspaceMemory"));

const router = source("js/router/paneRouter.js");
assert.ok(!router.includes("globalThis.scrollTo"));
assert.ok(!router.includes("document.documentElement.scrollTop"));
assert.match(router, /awt-pane-content/);

const compatibilityCss = source("css/final-normal-scroll.css");
assert.match(compatibilityCss, /viewport\/index\.css/);
assert.ok(!/height:\s*auto\s*!important/.test(compatibilityCss));
assert.ok(!/overflow:\s*visible\s*!important/.test(compatibilityCss));

const viewportIndex = source("css/viewport/index.css");
for (const file of [
	"shell.css",
	"workspace.css",
	"navigation.css",
	"home.css",
	"pages.css",
	"home-responsive.css",
	"responsive.css",
	"operator-polish.css"
]) {
	assert.ok(viewportIndex.includes(file), `Viewport index missing ${file}`);
}

const viewportShell = source("css/viewport/shell.css");
assert.match(viewportShell, /@layer awt\.reset/);
assert.match(viewportShell, /height:\s*100dvh/);
assert.match(viewportShell, /overflow:\s*hidden/);

const pages = source("css/viewport/pages.css");
assert.match(pages, /\.awt-pane-heading/);
assert.match(pages, /overflow-y:\s*auto\s*!important/);
assert.match(pages, /overflow-x:\s*clip\s*!important/);

const futureIndex = source("css/future/index.css");
assert.ok(!/views\/dashboard\/(layout|cards|responsive)\.css/.test(futureIndex));
for (const file of ["layout.css", "cards.css", "responsive.css"]) {
	assert.equal(
		existsSync(resolve(appRoot, "css/future/views/dashboard", file)),
		false,
		`Obsolete dashboard style remains: ${file}`
	);
}

const missionControl = source("css/future/views/mission-control-os.css");
assert.ok(!/body\.awt-(home|workspace)-mode/.test(missionControl));
assert.ok(!/\.awt-control-(shell|main)/.test(missionControl));

console.log("BHY viewport navigation architecture tests passed");
