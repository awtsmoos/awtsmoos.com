// B"H
// MERKAVA CSS engine completeness tests: custom properties, cascade, grid.
// Run: node tests/merkava-css-engine.test.cjs
const assert = require("assert");
const path = require("path");

const root = path.resolve(__dirname, "..");
const { VirtualDocument } = require(path.join(root, "merkava-browser/VirtualDocument.js"));
const { RetainedLayoutEngine } = require(path.join(root, "merkava-browser/RetainedLayoutEngine.js"));

let passed = 0;
function check(name, actual, expected) {
  assert.strictEqual(actual, expected, `${name}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
  passed++;
  console.log(`  ok ${name} => ${JSON.stringify(actual)}`);
}
function approx(name, actual, expected, tol = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tol, `${name}: got ${actual}, want ~${expected}`);
  passed++;
  console.log(`  ok ${name} => ${actual}`);
}
function freshDoc() { return new VirtualDocument(); }
function div(doc, attrs = {}) {
  const el = doc.createElement("div");
  if (attrs.id) el.id = attrs.id;
  if (attrs.cls) el.className = attrs.cls;
  if (attrs.style) el.setAttribute("style", attrs.style);
  if (attrs.text) el.textContent = attrs.text;
  return el;
}

// ---------------------------------------------------------------- variables
console.log("CSS custom properties");
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`:root { --brand: #ff0000; } div { color: var(--brand); }`);
  check("var() basic from :root", d.cssEngine.compute(el).color, "#ff0000");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`div { color: var(--missing, #00ff00); }`);
  check("var() fallback", d.cssEngine.compute(el).color, "#00ff00");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`:root { --b: #0000ff; } div { color: var(--a, var(--b)); }`);
  check("var() nested fallback", d.cssEngine.compute(el).color, "#0000ff");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`div { color: var(--a, var(--b, #123456)); }`);
  check("var() doubly nested fallback", d.cssEngine.compute(el).color, "#123456");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`:root { --b: #112233; --a: var(--b); } div { color: var(--a); }`);
  check("var() chained", d.cssEngine.compute(el).color, "#112233");
}
{
  const d = freshDoc();
  const parent = div(d); const el = div(d);
  parent.appendChild(el); d.body.appendChild(parent);
  d.cssEngine.parseStyleSheet(`div.wrap { --ink: #abcdef; } div { color: var(--ink); }`);
  parent.className = "wrap";
  check("custom property inherits to child", d.cssEngine.compute(el).color, "#abcdef");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`:root { --Brand: #111111; --brand: #222222; } div { color: var(--Brand); background-color: var(--brand); }`);
  const c = d.cssEngine.compute(el);
  check("custom property names are case-sensitive (1)", c.color, "#111111");
  check("custom property names are case-sensitive (2)", c["background-color"], "#222222");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`:root { --a: var(--b); --b: var(--a); } div { color: var(--a, #999999); }`);
  const c = d.cssEngine.compute(el).color;
  check("cyclic var() falls back", c, "#999999");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`:root { --w: 5px; --c: #010203; } div { border-width: var(--w); border-color: var(--c); }`);
  const c = d.cssEngine.compute(el);
  check("var() in border-width", c["border-width"], "5px");
  check("var() in border-color", c["border-color"], "#010203");
}
{
  const d = freshDoc();
  const el = div(d); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`:root { --x: 7px; } div { width: var( --x ); }`);
  check("var() tolerates whitespace", d.cssEngine.compute(el).width, "7px");
}

// ---------------------------------------------------------------- cascade
console.log("cascade: specificity, source order, !important");
{
  const d = freshDoc();
  const el = div(d, { id: "a", cls: "b" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`div { color: #111111; } .b { color: #222222; } #a { color: #333333; }`);
  check("specificity: id beats class beats type", d.cssEngine.compute(el).color, "#333333");
}
{
  const d = freshDoc();
  const el = div(d, { cls: "b" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`.b { color: #111111; } .b { color: #222222; }`);
  check("source order: later wins at equal specificity", d.cssEngine.compute(el).color, "#222222");
}
{
  const d = freshDoc();
  const el = div(d, { id: "a", cls: "b" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`#a { color: #333333; } .b { color: #222222 !important; }`);
  check("!important beats higher-specificity normal", d.cssEngine.compute(el).color, "#222222");
}
{
  const d = freshDoc();
  const el = div(d, { id: "a", cls: "b" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`.b { color: #222222 !important; } #a { color: #333333 !important; }`);
  check("!important vs !important: specificity still decides", d.cssEngine.compute(el).color, "#333333");
}
{
  const d = freshDoc();
  const el = div(d, { style: "color: #444444;" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`div { color: #111111; }`);
  check("inline style beats author normal", d.cssEngine.compute(el).color, "#444444");
}
{
  const d = freshDoc();
  const el = div(d, { style: "color: #444444;" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`div { color: #111111 !important; }`);
  check("author !important beats inline normal", d.cssEngine.compute(el).color, "#111111");
}
{
  const d = freshDoc();
  const el = div(d, { cls: "b" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`div, .b { color: #555555; }`);
  check("selector list matches", d.cssEngine.compute(el).color, "#555555");
}
{
  const d = freshDoc();
  const el = div(d, { cls: "b" }); d.body.appendChild(el);
  d.cssEngine.parseStyleSheet(`div.b { color: #666666; } div { color: #111111; }`);
  check("compound selector specificity (0,1,1) beats (0,0,1)", d.cssEngine.compute(el).color, "#666666");
}

// ---------------------------------------------------------------- grid
console.log("grid layout");
function layoutGrid(style, childStyles, childTexts) {
  const d = freshDoc();
  const grid = div(d, { style });
  const kids = childStyles.map((s, i) => div(d, { style: s, text: childTexts && childTexts[i] }));
  kids.forEach(k => grid.appendChild(k));
  d.body.appendChild(grid);
  const engine = new RetainedLayoutEngine(d);
  const tree = engine.layout({ width: 760, height: 600 });
  return tree.children[0];
}
{
  const g = layoutGrid("display: grid; grid-template-columns: 100px 200px; width: 300px;", ["", ""]);
  check("grid container width", g.width, 300);
  approx("grid col 1 x", g.children[0].x, g.x);
  approx("grid col 1 width", g.children[0].width, 100);
  approx("grid col 2 x", g.children[1].x, g.x + 100);
  approx("grid col 2 width", g.children[1].width, 200);
  check("grid auto-placement wraps to row 2", g.children.length, 2);
}
{
  const g = layoutGrid("display: grid; grid-template-columns: repeat(3, 1fr); width: 300px;", ["", "", ""]);
  approx("repeat(3,1fr) col width", g.children[0].width, 100);
  approx("repeat(3,1fr) third col x", g.children[2].x, g.x + 200);
  check("three columns placed", g.children.length, 3);
}
{
  const g = layoutGrid("display: grid; grid-template-columns: 100px 100px; gap: 20px; width: 220px;", ["", ""]);
  approx("gap shifts col 2", g.children[1].x, g.x + 120);
  approx("gap col width", g.children[0].width, 100);
}
{
  const g = layoutGrid(
    "display: grid; grid-template-columns: 100px 100px 100px; width: 300px;",
    ["grid-column: 1 / 3;", ""]
  );
  approx("explicit span width", g.children[0].width, 200);
  approx("next item starts at col 3", g.children[1].x, g.x + 200);
}
{
  const g = layoutGrid(
    "display: grid; grid-template-columns: 100px 100px; grid-template-rows: 50px 70px; width: 200px;",
    ["", "", ""]
  );
  approx("row 1 height", g.children[0].height > 0 ? 50 : -1, 50);
  approx("row 2 item y", g.children[2].y, g.y + 50);
  check("explicit rows lay out 3 items", g.children.length, 3);
}
{
  const g = layoutGrid(
    "display: grid; grid-template-columns: 100px 100px; width: 200px;",
    ["", "", "", ""],
    ["a", "b", "c", "d"]
  );
  check("auto-placement wraps 4 items into 2 rows", g.children.length, 4);
  approx("row 2 starts below row 1", g.children[2].y > g.children[0].y ? 1 : 0, 1);
  approx("row 2 col 1 x", g.children[2].x, g.x);
}
{
  const g = layoutGrid(
    "display: grid; grid-template-columns: 1fr 2fr; width: 300px;",
    ["", ""]
  );
  approx("fr unit distributes space", g.children[0].width, 100);
  approx("fr unit 2fr gets double", g.children[1].width, 200);
}

console.log(`\nB"H — all ${passed} CSS engine checks passed.`);
