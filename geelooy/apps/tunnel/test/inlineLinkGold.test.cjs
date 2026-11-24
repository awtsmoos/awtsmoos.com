// B"H
const assert = require("assert");
const fs = require("fs");

// Run 05 regression: the /apps/code link inside the browser-mode .lede
// paragraph rendered UA-default blue because only .steps a was gold.
const css = fs.readFileSync("geelooy/apps/tunnel/css/tunnel.css", "utf8");
const html = fs.readFileSync("geelooy/apps/tunnel/index.html", "utf8");
assert(/a:not\(\.button\)\s*{\s*color:\s*var\(--accent\)/.test(css),
	"every non-button anchor must use the gold --accent family");
assert(html.includes('class="lede"') && html.includes('href="/apps/code/"'),
	"the .lede /apps/code in-text link this rule covers must exist");
assert(!css.includes("#1f6fb2") && !css.includes("#7a4fb5"),
	"no blue/violet accent hexes may return to tunnel.css");
console.log("BHY tunnel inline link gold tests passed");
