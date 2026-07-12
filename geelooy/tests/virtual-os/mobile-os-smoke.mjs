// B"H

import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const containsAll = (source, terms, label) => {
	for (const term of terms) assert(source.includes(term), `${label} missing ${term}`);
};

const basic = read("geelooy/scripts/awtsmoos/ui/basic.js");
containsAll(basic, ["validAttribute", "isNode", "appendChildren", "setAttributes", "Node"], "basic helper");

const surface = read("geelooy/os/desktopSurface.js");
containsAll(surface, ["applySafeArea", "mobileClass", "bindLongPress", "isTap", "bindRelayout", "isMobileDesktop"], "desktop surface mobile hook");

const layout = read("geelooy/os/desktop/layout.js");
containsAll(layout, ["metrics(surface)", "pointForIndex", "m.cols", "m.cellW", "m.cellH"], "mobile layout");

const drag = read("geelooy/os/desktop/drag.js");
const overlay = read("geelooy/os/desktop/selectionOverlay.js");
containsAll(drag, ["isMobileDesktop(surface)", "createMarquee", "event.cancelable", "savePositions(positions, drag.mobile)"], "mobile drag");
assert(overlay.includes("desktop-marquee"), "selection overlay missing desktop-marquee");

const mobileModules = fs.readdirSync("geelooy/os/styles/base/mobile")
	.filter(name => name.endsWith(".js"))
	.map(name => read(`geelooy/os/styles/base/mobile/${name}`));
const css = [
	read("geelooy/os/styles/os-base.js"),
	read("geelooy/os/styles/base/mobile.js"),
	...mobileModules,
	read("geelooy/os/styles/base/desktop.js"),
	read("geelooy/os/styles/base/icons.js")
].join("\n").replace(/\s+/g, "");
containsAll(css, ["desktop-mobile", "100svh", "--desktop-safe-top", "touch-action:none", "-webkit-tap-highlight-color", "desktop-marquee{display:none", "min-width:42px"], "mobile CSS");

const explorerCss = [
	read("geelooy/os/programs/awtsmoos-file-explorer/styles/future/mobile.js"),
	read("geelooy/os/programs/awtsmoos-file-explorer/styles/future/toolbar.js")
].join("\n").replace(/\s+/g, "");
containsAll(explorerCss, ["pointer:coarse", "grid-template-columns:repeat(4", "toolbar-search", "-webkit-overflow-scrolling:touch"], "mobile Explorer CSS");
assert(/min-height:(?:4[2-9]|[5-9]\d|\d{3,})px/.test(explorerCss), "mobile Explorer touch target must be at least 42px");

console.log("B\"H mobile-os-smoke passed");
