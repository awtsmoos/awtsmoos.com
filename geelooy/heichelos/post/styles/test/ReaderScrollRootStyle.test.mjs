// B"H
/**
 * Chapter 304: Reader scroll style contract.
 * The reader must stay visually calm and naturally scrollable: no fixed shell,
 * no hidden document, no giant trapped wrapper. The browser page is the main
 * river, while the wheel bridge can still redirect nested verse wheel events.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync('geelooy/heichelos/post/styles/main.css', 'utf8');
const scrollRoot = readFileSync('geelooy/heichelos/post/styles/ideal/reborn/scroll-root.css', 'utf8');
const auto = readFileSync('geelooy/heichelos/post/actions/AutoScrollDown.js', 'utf8');
const repair = readFileSync('geelooy/heichelos/post/logic/scroll/ReaderScrollRepair.js', 'utf8');
const bridge = readFileSync('geelooy/heichelos/post/logic/scroll/ReaderWheelBridge.js', 'utf8');

assert.match(main, /scroll-root\.css/, 'main.css must import scroll-root');
assert.match(scrollRoot, /overflow-y: auto !important/, 'document must remain scrollable');
assert.match(scrollRoot, /position: relative !important/, 'reader shell must not be fixed');
assert.match(scrollRoot, /overflow-y: visible !important/, 'reader content must not trap the page');
assert.doesNotMatch(scrollRoot, /position: fixed !important/, 'fixed shell must not return');
assert.doesNotMatch(scrollRoot, /html[\s\S]{[^}]*overflow: hidden !important/, 'html must not be hidden');
assert.match(repair, /natural-document-river/, 'runtime repair must declare natural mode');
assert.match(repair, /\["position", "relative"\]/, 'runtime repair must undo fixed positioning');
assert.match(repair, /\["overflow-y", "auto"\]/, 'runtime repair must keep document vertical scroll');
assert.match(bridge, /document-fallback/, 'wheel bridge must fall back to document');
assert.match(bridge, /activeVessel/, 'wheel bridge must choose active vessel');
assert.match(auto, /documentMax/, 'auto-scroll must understand document scroll height');
assert.match(auto, /writeTop\(root/, 'auto-scroll must move the winning vessel through abstraction');
console.log('B"H ReaderScrollRootStyle.test passed');
