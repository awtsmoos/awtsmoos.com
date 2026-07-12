// B"H

import assert from "node:assert/strict";
import fs from "node:fs";

const mobileModules = fs.readdirSync("geelooy/os/styles/base/mobile")
	.filter(name => name.endsWith(".js"))
	.map(name => `geelooy/os/styles/base/mobile/${name}`);
const files = [
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/tokens.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/frame.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/toolbar.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/drives.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/sidebar.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/viewGrid.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/details.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/path.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/menus.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/mobile.js",
	"geelooy/os/programs/awtsmoos-file-explorer/styles/future/scrollbars.js",
	"geelooy/os/styles/base/desktop.js",
	"geelooy/os/styles/base/icons.js",
	"geelooy/os/styles/base/contextMenu.js",
	"geelooy/os/styles/base/diagnostics.js",
	"geelooy/os/styles/base/mobile.js",
	...mobileModules,
	"geelooy/os/styles/base/index.js",
	"geelooy/os/window/title.js",
	"geelooy/os/window/mobile.js",
	"geelooy/os/window/styles.js",
	"geelooy/os/window/frame.js"
];
for (const file of files) {
	const text = fs.readFileSync(file, "utf8");
	assert(text.includes("B\"H"), `${file} missing B\"H`);
	assert(text.split("\n").length <= 100, `${file} should stay tiny`);
}
const future = fs.readFileSync("geelooy/os/programs/awtsmoos-file-explorer/styles/futureUnified.js", "utf8");
for (const name of ["tokens", "frame", "toolbar", "drives", "sidebar", "viewGrid", "details", "path", "menus", "scrollbars", "mobile"]) {
	assert(future.includes(`./future/${name}.js`), `future aggregator missing ${name}`);
}
const osBase = fs.readFileSync("geelooy/os/styles/os-base.js", "utf8");
assert(osBase.includes("./base/index.js"), "os base must delegate to split base index");
const windows = fs.readFileSync("geelooy/os/windows.js", "utf8");
for (const name of ["./window/title.js", "./window/mobile.js", "./window/styles.js", "./window/frame.js"]) {
	assert(windows.includes(name), `windows missing ${name}`);
}
console.log("B\"H style-split-smoke passed");
