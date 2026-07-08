// B"H
/**
 * Second seven-step court.
 * This verifies chips, badges, states, editor, comments, desktop, and mobile
 * shared layers were improved without touching the forbidden post vessel.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { execSync } from "node:child_process";

const read = file => fs.readFileSync(file, "utf8");
const chips = read("geelooy/style/social-system/product/chips.css");
const badges = read("geelooy/style/social-system/product/badges.css");
const states = read("geelooy/style/social-system/states.css");
const editor = read("geelooy/style/social-system/editor.css");
const comments = read("geelooy/style/social-system/comments.css");
const desktop = read("geelooy/style/social-system/desktop.css");
const mobile = read("geelooy/style/social-system/mobile.css");

assert.match(chips, /min-height:\s*36px/, "chips must become touchable controls");
assert.match(badges, /badge-live/, "badges must include live status language");
assert.match(states, /awt-state-breathe/, "states must include shared loading motion");
assert.match(editor, /data-editor-shell/, "editor must expose shared shell architecture");
assert.match(comments, /data-comments-shell/, "comments must expose shared shell architecture");
assert.match(desktop, /grid-template-columns:\s*minmax\(0, 1fr\)/, "desktop must use overflow-safe primary columns");
assert.match(mobile, /100dvw/, "mobile must use dynamic viewport width instead of 100vw");

const changed = execSync("git diff --name-only", { encoding: "utf8" }).trim().split(/\n/).filter(Boolean);
assert.equal(changed.some(file => file.startsWith("geelooy/heichelos/post/")), false, "forbidden heichelos/post path was touched");
console.log('B"H uiSecondSevenStepArchitecture.test passed');
