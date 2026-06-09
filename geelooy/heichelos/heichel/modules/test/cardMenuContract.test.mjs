// B"H
/**
 * Chapter 270 test: the card menu opens from the dot, not from chaos.
 *
 * The active Heichel page renders cards from modules/ui/render/grids.js. This
 * static contract protects the mobile menu fix: only the trigger toggles, menu
 * clicks are stopped, outside pointer/Escape closers exist, and ARIA state is
 * maintained.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("geelooy/heichelos/heichel/modules/ui/render/grids.js", "utf8");

assert.match(source, /function\s+toggleCardMenu\s*\(/, "trigger toggle function must exist");
assert.match(source, /events:\s*\{\s*click:\s*toggleCardMenu\s*\}/, "trigger click should toggle menu");
assert.match(source, /events:\s*\{\s*click:\s*stopMenuLeak\s*\}/, "menu wrapper should stop bubbling");
assert.match(source, /document\.addEventListener\("pointerdown"/, "outside pointer closer must exist");
assert.match(source, /event\.key\s*===\s*"Escape"/, "Escape closer must exist");
assert.match(source, /aria-expanded/, "menu trigger should maintain aria-expanded");
assert.match(source, /closeAllMenus\(menu\)/, "opening one menu should close siblings");
assert.doesNotMatch(source, /card-menu-spark[\s\S]{0,180}classList\.toggle\("open"\)/, "spark wrapper must not broadly toggle on all child clicks");

console.log('B"H cardMenuContract.test passed');
