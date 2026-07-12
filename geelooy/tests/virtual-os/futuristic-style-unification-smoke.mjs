// B"H

import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const explorer = read("geelooy/os/programs/awtsmoos-file-explorer/styles/index.js");
const future = [
	"futureUnified.js",
	"future/tokens.js",
	"future/frame.js",
	"future/toolbar.js",
	"future/viewGrid.js",
	"future/details.js",
	"future/menus.js",
	"future/mobile.js"
].map(path => read(`geelooy/os/programs/awtsmoos-file-explorer/styles/${path}`)).join("\n");
const mobile = fs.readdirSync("geelooy/os/styles/base/mobile")
	.filter(name => name.endsWith(".js"))
	.map(name => read(`geelooy/os/styles/base/mobile/${name}`));
const base = [
	read("geelooy/os/styles/os-base.js"),
	read("geelooy/os/styles/base/desktop.js"),
	read("geelooy/os/styles/base/icons.js"),
	read("geelooy/os/styles/base/contextMenu.js"),
	read("geelooy/os/styles/base/diagnostics.js"),
	read("geelooy/os/styles/base/mobile.js"),
	...mobile
].join("\n");
const windows = [
	"windows.js",
	"window/title.js",
	"window/mobile.js",
	"window/styles.js",
	"window/frame.js"
].map(path => read(`geelooy/os/${path}`)).join("\n");

for (const term of ["futureUnified", "one style source of truth"]) assert(explorer.includes(term), `style index missing ${term}`);
for (const term of ["--awt-panel", "backdrop-filter", "linear-gradient", "toolbar-search", "file-explorer-body", "contextMenu"]) assert(future.includes(term), `future CSS missing ${term}`);
for (const term of ["awtsmoos-diagnostics-window", "desktop-icon", "overflow:auto", "desktop-mobile", "radial-gradient"]) assert(base.includes(term), `base CSS missing ${term}`);
for (const term of ["safeTitle", "Awtsmoos Window", "awts-window", "isPhoneWindow", "header-btn"]) assert(windows.includes(term), `window safety missing ${term}`);

console.log("B\"H futuristic-style-unification-smoke passed");
