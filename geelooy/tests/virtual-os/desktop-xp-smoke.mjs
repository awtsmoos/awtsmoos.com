// B"H

import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const files = [
	"geelooy/os/desktop/icons.js",
	"geelooy/os/desktop/selection.js",
	"geelooy/os/desktop/drag.js",
	"geelooy/os/desktop/storage.js",
	"geelooy/os/desktop/layout.js",
	"geelooy/os/desktop/contextMenu.js",
	"geelooy/os/desktop/keyboard.js"
];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`${file} missing`);

const icons = read("geelooy/os/desktop/icons.js");
// The desktop intentionally surfaces four favorites; Command remains in the
// complete launcher catalog rather than cluttering the first page.
const secondary = read("geelooy/os/shell/appCatalogSecondary.js");
if (!secondary.includes('id: "command"')) throw new Error("Command app missing from launcher catalog");
if (!icons.includes("surfaceApps(APP_CATALOG)")) throw new Error("desktop favorites not sourced from catalog");
for (const term of ["connected-tunnels", "Connected Computers", "Awtsmoos Virtual OS", "Preview Artifacts"]) {
	if (!icons.includes(term)) throw new Error(`desktop icon missing ${term}`);
}
for (const [file, term] of [
	["geelooy/os/desktop/selection.js", "createDesktopSelection"],
	["geelooy/os/desktop/drag.js", "bindDesktopDrag"],
	["geelooy/os/desktop/storage.js", "loadPositions"]
]) {
	if (!read(file).includes(term)) throw new Error(`${term} missing`);
}

const styleFiles = [
	"geelooy/os/styles/os-base.js",
	"geelooy/os/styles/base/desktop.js",
	"geelooy/os/styles/base/icons.js",
	"geelooy/os/styles/base/mobile.js",
	...fs.readdirSync("geelooy/os/styles/base/mobile")
		.filter(name => name.endsWith(".js"))
		.map(name => `geelooy/os/styles/base/mobile/${name}`)
];
const css = styleFiles.map(read).join("\n");
for (const term of ["desktop-marquee", "desktop-icon.selected", "position:absolute", "touch-action:none", "border:1px dotted", "Trebuchet MS", "Tahoma"]) {
	if (!css.includes(term)) throw new Error(`desktop base style missing ${term}`);
}

console.log("B\"H desktop-xp-smoke passed");
