// B"H
const assert = require("assert");
const fs = require("fs");

// Run 10 regression: in a returning browser the onboarding.js module fetch
// failed once and the chooser was dead with an EMPTY detail box, because
// the markup shipped empty and only that module could fill it. The markup
// must ship the native default, and the page must carry an inline recovery
// guard (part of the never-cached HTML) that re-imports the pinned module
// and otherwise binds a fallback chooser.
const html = fs.readFileSync("geelooy/apps/tunnel/index.html", "utf8");

const detail = html.match(/<p class="note" id="onboardDetail">([^<]+)<\/p>/);
assert(detail, "#onboardDetail must exist");
assert(detail[1].includes("Full local filesystem"),
	"#onboardDetail must ship the native detail text, never empty");

const go = html.match(/<a class="button primary small" id="onboardGo" href="#install">([^<]+)<\/a>/);
assert(go, "#onboardGo must exist");
assert(go[1].includes("Continue: Native tunnel on your own computer"),
	"#onboardGo must ship the full native Continue label");

assert(html.includes("root.dataset.onboardingMounted"),
	"inline guard must check whether the real module mounted");
assert(html.includes("import(url.href)"),
	"inline guard must re-import the pinned onboarding module on failure");
assert(html.includes("bindFallback"),
	"inline guard must bind a fallback chooser if the re-import fails");
assert(html.includes('searchParams.set("r"'),
	"the recovery import must bust a poisoned cache entry");

console.log("BHY tunnel chooser resilience tests passed");
