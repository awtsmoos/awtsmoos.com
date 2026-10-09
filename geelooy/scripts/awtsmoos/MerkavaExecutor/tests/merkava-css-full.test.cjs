//B"H
// Comprehensive tests for MERKAVA full CSS support:
// CssTransform, CssTransition, CssPseudoElements, FlexLayout,
// extended CssPseudoMatcher states, extended media queries,
// declaration shorthand expansion.
// Run: node tests/merkava-css-full.test.cjs

const assert = require("node:assert/strict");

const BROWSER = "../merkava-browser";
const CssTransform = require(`${BROWSER}/standards/css/CssTransform.js`);
const CssTransition = require(`${BROWSER}/standards/css/CssTransition.js`);
const CssPseudoElements = require(`${BROWSER}/standards/css/CssPseudoElements.js`);
const FlexLayout = require(`${BROWSER}/standards/layout/FlexLayout.js`);
const PseudoMatcher = require(`${BROWSER}/standards/css/CssPseudoMatcher.js`);
const ConditionEvaluator = require(`${BROWSER}/standards/css/CssConditionEvaluator.js`);
const Expander = require(`${BROWSER}/standards/css/CssDeclarationExpander.js`);

let passed = 0;
let failed = 0;
function test(name, fn) {
	try {
		fn();
		passed += 1;
	} catch (err) {
		failed += 1;
		console.error(`FAIL ${name}: ${err.message}`);
	}
}
const approx = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

// ---------------- CssTransform ----------------
test("transform: parse translate/rotate/scale", () => {
	const list = CssTransform.parseTransform("translate(10px, 20px) rotate(90deg) scale(2)");
	assert.equal(list.length, 3);
	assert.equal(list[0].name, "translate");
	assert.deepEqual(list[0].args, ["10px", "20px"]);
	assert.equal(list[1].name, "rotate");
	assert.equal(list[2].name, "scale");
});
test("transform: none parses to empty", () => {
	assert.deepEqual(CssTransform.parseTransform("none"), []);
	assert.deepEqual(CssTransform.parseTransform(""), []);
});
test("transform: translate matrix", () => {
	const m = CssTransform.computeTransformMatrix({ transform: "translate(10px, 5px)" }, {});
	assert.deepEqual(m, [1, 0, 0, 1, 10, 5]);
});
test("transform: rotate 90deg", () => {
	const m = CssTransform.computeTransformMatrix({ transform: "rotate(90deg)" }, { width: 100, height: 100 });
	const [x, y] = CssTransform.applyMatrixToPoint(m, 100, 50);
	assert.ok(approx(x, 50) && approx(y, 100), `got ${x},${y}`);
});
test("transform: scale about origin", () => {
	const m = CssTransform.computeTransformMatrix(
		{ transform: "scale(2)", "transform-origin": "0 0" },
		{ width: 100, height: 100 }
	);
	const [x, y] = CssTransform.applyMatrixToPoint(m, 10, 10);
	assert.ok(approx(x, 20) && approx(y, 20), `got ${x},${y}`);
});
test("transform: default origin is center", () => {
	const m = CssTransform.computeTransformMatrix({ transform: "scale(2)" }, { width: 100, height: 100 });
	const [x, y] = CssTransform.applyMatrixToPoint(m, 50, 50);
	assert.ok(approx(x, 50) && approx(y, 50), `center must stay fixed, got ${x},${y}`);
});
test("transform: percentage translate resolves against box", () => {
	const m = CssTransform.computeTransformMatrix({ transform: "translate(50%, 25%)" }, { width: 200, height: 100 });
	assert.ok(approx(m[4], 100) && approx(m[5], 25));
});
test("transform: skew + matrix()", () => {
	const skew = CssTransform.computeTransformMatrix({ transform: "skewX(45deg)" }, {});
	assert.ok(approx(skew[2], 1), `tan(45deg)=1, got ${skew[2]}`);
	const mat = CssTransform.computeTransformMatrix({ transform: "matrix(1, 2, 3, 4, 5, 6)" }, {});
	assert.deepEqual(mat, [1, 2, 3, 4, 5, 6]);
});
test("transform: transformRect bounding box", () => {
	const m = CssTransform.computeTransformMatrix({ transform: "rotate(90deg)", "transform-origin": "0 0" }, {});
	const r = CssTransform.transformRect(m, 0, 0, 100, 50);
	assert.ok(approx(r.x, -50) && approx(r.y, 0) && approx(r.width, 50) && approx(r.height, 100), JSON.stringify(r));
});
test("transform: matrixToCss round-trips", () => {
	const m = CssTransform.computeTransformMatrix({ transform: "translate(3px, 4px) scale(2)" }, {});
	const css = CssTransform.matrixToCss(m);
	assert.ok(css.startsWith("matrix("), css);
	const back = CssTransform.computeTransformMatrix({ transform: css }, {});
	assert.ok(back.every((v, i) => approx(v, m[i])), `${css} -> ${back}`);
});
test("transform: angle units", () => {
	assert.ok(approx(CssTransform.angleToRad("180deg"), Math.PI));
	assert.ok(approx(CssTransform.angleToRad("0.5turn"), Math.PI));
	assert.ok(approx(CssTransform.angleToRad("3.14159rad"), Math.PI, 1e-4));
});

// ---------------- CssTransition ----------------
test("transition: parse shorthand", () => {
	const [t] = CssTransition.parseTransition("opacity 200ms ease-in 50ms");
	assert.equal(t.property, "opacity");
	assert.equal(t.duration, 200);
	assert.equal(t.delay, 50);
	assert.equal(t.timing.type, "cubic-bezier");
});
test("transition: multiple + defaults", () => {
	const list = CssTransition.parseTransition("color 1s, width 2s linear");
	assert.equal(list.length, 2);
	assert.equal(list[0].property, "color");
	assert.equal(list[0].duration, 1000);
	assert.equal(list[1].timing.type, "cubic-bezier");
});
test("transition: none -> empty", () => {
	assert.deepEqual(CssTransition.parseTransition("none"), []);
});
test("transition: linear timing is identity", () => {
	const tf = CssTransition.parseTimingFunction("linear");
	assert.ok(approx(CssTransition.timingProgress(tf, 0.37), 0.37, 1e-4));
});
test("transition: steps", () => {
	const tf = CssTransition.parseTimingFunction("steps(4, end)");
	assert.equal(CssTransition.timingProgress(tf, 0.3), 0.25);
	assert.equal(CssTransition.timingProgress(tf, 1), 1);
	const start = CssTransition.parseTimingFunction("step-start");
	assert.equal(CssTransition.timingProgress(start, 0), 1);
});
test("transition: ease passes through endpoints", () => {
	const tf = CssTransition.parseTimingFunction("ease");
	assert.ok(approx(CssTransition.timingProgress(tf, 0), 0, 1e-4));
	assert.ok(approx(CssTransition.timingProgress(tf, 1), 1, 1e-4));
	const mid = CssTransition.timingProgress(tf, 0.5);
	assert.ok(mid > 0.5 && mid < 0.9, `ease(0.5)=${mid}`);
});
test("transition: interpolate numbers", () => {
	assert.equal(CssTransition.interpolateValue("0px", "100px", 0.25), "25px");
	assert.equal(CssTransition.interpolateValue("1", "2", 0.5), "1.5");
});
test("transition: interpolate colors", () => {
	const v = CssTransition.interpolateValue("#000000", "#ffffff", 0.5);
	assert.equal(v, "rgb(128, 128, 128)");
});
test("transition: discrete flip", () => {
	assert.equal(CssTransition.interpolateValue("left", "right", 0.4), "left");
	assert.equal(CssTransition.interpolateValue("left", "right", 0.6), "right");
});
test("transition: tick lifecycle", () => {
	const st = CssTransition.createTransition("0px", "100px", { duration: 1000, timing: CssTransition.parseTimingFunction("linear") });
	let r = CssTransition.tickTransition(st, 0);
	assert.equal(r.value, "0px");
	assert.equal(r.done, false);
	r = CssTransition.tickTransition(st, 500);
	assert.equal(r.value, "50px");
	r = CssTransition.tickTransition(st, 1000);
	assert.equal(r.done, true);
	assert.equal(r.value, "100px");
});
test("transition: delay holds start value", () => {
	const st = CssTransition.createTransition("0px", "100px", { duration: 1000, delay: 500, timing: CssTransition.parseTimingFunction("linear") });
	const r = CssTransition.tickTransition(st, 250);
	assert.equal(r.value, "0px");
	assert.equal(r.done, false);
});
test("transition: transitionForProperty picks all/name", () => {
	const list = CssTransition.parseTransition("all 1s, opacity 2s");
	const win = CssTransition.transitionForProperty(list, "opacity");
	assert.equal(win.duration, 2000);
	const other = CssTransition.transitionForProperty(list, "width");
	assert.equal(other.duration, 1000);
});

// ---------------- CssPseudoElements ----------------
function mockEl(attrs = {}, parent = null) {
	return {
		__merkavaCounters: undefined,
		children: [],
		getAttribute: name => (name in attrs ? attrs[name] : null),
		localName: "div",
		nodeType: 1,
		ownerDocument: { __merkavaCounters: {} },
		parentNode: parent
	};
}
test("pseudo-elements: content string", () => {
	assert.equal(CssPseudoElements.resolveContent('"hello"', mockEl()), "hello");
	assert.equal(CssPseudoElements.resolveContent("'a b'", mockEl()), "a b");
});
test("pseudo-elements: content none/normal -> null", () => {
	assert.equal(CssPseudoElements.resolveContent("none", mockEl()), null);
	assert.equal(CssPseudoElements.resolveContent("normal", mockEl()), null);
	assert.equal(CssPseudoElements.resolveContent("", mockEl()), null);
});
test("pseudo-elements: attr()", () => {
	assert.equal(CssPseudoElements.resolveContent("attr(data-x)", mockEl({ "data-x": "42" })), "42");
});
test("pseudo-elements: counter()", () => {
	const el = mockEl();
	el.ownerDocument.__merkavaCounters = { sec: 7 };
	assert.equal(CssPseudoElements.resolveContent("counter(sec)", el), "7");
});
test("pseudo-elements: mixed content", () => {
	assert.equal(CssPseudoElements.resolveContent('"[" attr(data-n) "]"', mockEl({ "data-n": "3" })), "[3]");
});
test("pseudo-elements: splitPseudoSelector", () => {
	assert.deepEqual(CssPseudoElements.splitPseudoSelector("p::before"), { base: "p", pseudo: "before" });
	assert.deepEqual(CssPseudoElements.splitPseudoSelector("p::hover"), { base: "p::hover", pseudo: "" });
	assert.deepEqual(CssPseudoElements.splitPseudoSelector(".a::first-line"), { base: ".a", pseudo: "first-line" });
});
test("pseudo-elements: matchPseudoRules filters by pseudo", () => {
	const el = mockEl();
	el.localName = "p";
	const rules = [
		{ selector: "p::before", declarations: [], specificity: [0, 0, 0, 1], order: 0 },
		{ selector: "p::after", declarations: [], specificity: [0, 0, 0, 1], order: 1 },
		{ selector: "div::before", declarations: [], specificity: [0, 0, 0, 1], order: 2 }
	];
	const before = CssPseudoElements.matchPseudoRules(el, "before", rules);
	assert.equal(before.length, 1);
	assert.equal(before[0].selector, "p::before");
});
test("pseudo-elements: generatedBoxSpec needs content", () => {
	assert.equal(CssPseudoElements.generatedBoxSpec(mockEl(), "before", { content: "none" }), null);
	const spec = CssPseudoElements.generatedBoxSpec(mockEl(), "before", { content: '"x"', display: "block" });
	assert.equal(spec.content, "x");
	assert.equal(spec.display, "block");
	assert.equal(spec.pseudo, "before");
});
test("pseudo-elements: applyCounters", () => {
	const el = mockEl();
	CssPseudoElements.applyCounters(el, { "counter-reset": "sec 5", "counter-increment": "sec 2" });
	assert.equal(el.ownerDocument.__merkavaCounters.sec, 7);
});

// ---------------- FlexLayout ----------------
function flexItems(n, mainSize = 100, crossSize = 50, style = {}) {
	return Array.from({ length: n }, () => ({ style: { ...style }, mainSize, crossSize }));
}
test("flex: basic row layout", () => {
	const r = FlexLayout.layoutFlexItems({ "flex-direction": "row", gap: "10px" }, 500, flexItems(3));
	assert.equal(r.items.length, 3);
	assert.ok(Math.abs(r.items[0].x - 0) < 1e-6);
	assert.ok(Math.abs(r.items[1].x - 110) < 1e-6, JSON.stringify(r.items[1]));
	assert.ok(Math.abs(r.items[2].x - 220) < 1e-6);
});
test("flex: justify-content center", () => {
	const r = FlexLayout.layoutFlexItems({ "justify-content": "center" }, 500, flexItems(2));
	assert.ok(Math.abs(r.items[0].x - 150) < 1e-6, JSON.stringify(r.items.map(i => i.x)));
});
test("flex: justify-content space-between", () => {
	const r = FlexLayout.layoutFlexItems({ "justify-content": "space-between" }, 500, flexItems(2));
	assert.ok(Math.abs(r.items[0].x - 0) < 1e-6);
	assert.ok(Math.abs(r.items[1].x - 400) < 1e-6, JSON.stringify(r.items.map(i => i.x)));
});
test("flex: flex-grow distributes free space", () => {
	const items = [{ style: { "flex-grow": "1" }, mainSize: 100, crossSize: 50 }, { style: { "flex-grow": "3" }, mainSize: 100, crossSize: 50 }];
	const r = FlexLayout.layoutFlexItems({}, 600, items);
	assert.ok(Math.abs(r.items[0].width - 200) < 1e-6, JSON.stringify(r.items.map(i => i.width)));
	assert.ok(Math.abs(r.items[1].width - 400) < 1e-6);
});
test("flex: flex-shrink shrinks proportionally", () => {
	const items = [{ style: { "flex-shrink": "1" }, mainSize: 200, crossSize: 50 }, { style: { "flex-shrink": "3" }, mainSize: 200, crossSize: 50 }];
	const r = FlexLayout.layoutFlexItems({}, 200, items);
	const total = r.items[0].width + r.items[1].width;
	assert.ok(Math.abs(total - 200) < 1e-6, `total=${total}`);
	assert.ok(r.items[1].width < r.items[0].width);
});
test("flex: wrap creates lines", () => {
	const r = FlexLayout.layoutFlexItems({ "flex-wrap": "wrap" }, 250, flexItems(3));
	assert.equal(r.lines.length, 2);
	assert.equal(r.items[2].line, 1);
	assert.ok(r.items[2].y > r.items[0].y);
});
test("flex: order reorders", () => {
	const items = [
		{ style: { order: "2" }, mainSize: 100, crossSize: 50 },
		{ style: { order: "1" }, mainSize: 150, crossSize: 50 }
	];
	const r = FlexLayout.layoutFlexItems({}, 500, items);
	assert.equal(r.items[0].width, 150);
	assert.equal(r.items[0].x, 0);
	assert.equal(r.items[1].width, 100);
	assert.equal(r.items[1].x, 150);
});
test("flex: column direction", () => {
	const r = FlexLayout.layoutFlexItems({ "flex-direction": "column", gap: "5px" }, 400, flexItems(2));
	assert.ok(Math.abs(r.items[0].y - 0) < 1e-6);
	assert.ok(Math.abs(r.items[1].y - 105) < 1e-6, JSON.stringify(r.items[1]));
});
test("flex: align-items center", () => {
	const items = [{ style: {}, mainSize: 100, crossSize: 30 }, { style: {}, mainSize: 100, crossSize: 60 }];
	const r = FlexLayout.layoutFlexItems({ "align-items": "center", height: "100px" }, 500, items);
	assert.ok(Math.abs(r.items[0].y - 35) < 1e-6, JSON.stringify(r.items.map(i => i.y)));
	assert.ok(Math.abs(r.items[1].y - 20) < 1e-6);
});
test("flex: align-self overrides", () => {
	const items = [{ style: { "align-self": "flex-end" }, mainSize: 100, crossSize: 30 }, { style: {}, mainSize: 100, crossSize: 30 }];
	const r = FlexLayout.layoutFlexItems({ height: "100px" }, 500, items);
	assert.ok(r.items[0].y > r.items[1].y, JSON.stringify(r.items.map(i => i.y)));
});
test("flex: flex shorthand expands", () => {
	const p = FlexLayout.parseFlexShorthand("2 1 10%");
	assert.equal(p.grow, 2);
	assert.equal(p.shrink, 1);
	const single = FlexLayout.parseFlexShorthand("3");
	assert.equal(single.grow, 3);
	assert.equal(single.basis, 0);
});

// ---------------- PseudoMatcher states ----------------
function stateEl(localName = "div", attrs = {}, state = {}) {
	return {
		__merkavaState: state,
		checked: false,
		children: [],
		disabled: false,
		getAttribute: n => (n in attrs ? attrs[n] : null),
		id: attrs.id || "",
		localName,
		nodeType: 1,
		ownerDocument: { activeElement: null, __merkavaTargetId: "" },
		parentNode: null,
		value: attrs.value || ""
	};
}
const stubMatch = () => true;
test("pseudo: :hover / :active", () => {
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("div", {}, { hover: true }), "hover", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("div"), "hover", "", stubMatch), false);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("button", {}, { active: true }), "active", "", stubMatch), true);
});
test("pseudo: :link / :visited", () => {
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("a", { href: "/x" }), "link", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("a", { href: "/x" }, { visited: true }), "link", "", stubMatch), false);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("a", { href: "/x" }, { visited: true }), "visited", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("span"), "link", "", stubMatch), false);
});
test("pseudo: :target", () => {
	const el = stateEl("section", { id: "s1" });
	el.ownerDocument.__merkavaTargetId = "s1";
	assert.equal(PseudoMatcher.matchesCssPseudo(el, "target", "", stubMatch), true);
	el.ownerDocument.__merkavaTargetId = "other";
	assert.equal(PseudoMatcher.matchesCssPseudo(el, "target", "", stubMatch), false);
});
test("pseudo: :focus-within", () => {
	const child = stateEl("input");
	const parent = stateEl("form");
	child.parentNode = parent;
	parent.ownerDocument.activeElement = child;
	assert.equal(PseudoMatcher.matchesCssPseudo(parent, "focus-within", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(child, "focus-within", "", stubMatch), false);
});
test("pseudo: :required / :optional", () => {
	const req = stateEl("input");
	req.required = true;
	assert.equal(PseudoMatcher.matchesCssPseudo(req, "required", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("input"), "optional", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("div"), "optional", "", stubMatch), false);
});
test("pseudo: :read-only / :read-write", () => {
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("input"), "read-write", "", stubMatch), true);
	const ro = stateEl("input", { readonly: "" });
	assert.equal(PseudoMatcher.matchesCssPseudo(ro, "read-only", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(ro, "read-write", "", stubMatch), false);
});
test("pseudo: :placeholder-shown", () => {
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("input", { placeholder: "x", value: "" }), "placeholder-shown", "", stubMatch), true);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("input", { placeholder: "x", value: "y" }), "placeholder-shown", "", stubMatch), false);
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("input", { value: "" }), "placeholder-shown", "", stubMatch), false);
});
test("pseudo: :default", () => {
	assert.equal(PseudoMatcher.matchesCssPseudo(stateEl("button"), "default", "", stubMatch), true);
	const checked = stateEl("input", { type: "checkbox" });
	checked.checked = true;
	assert.equal(PseudoMatcher.matchesCssPseudo(checked, "default", "", stubMatch), true);
});

// ---------------- Media queries ----------------
const ENV = { height: 800, width: 1024 };
test("media: px still works", () => {
	assert.equal(ConditionEvaluator.matchesMediaQuery("(min-width: 800px)", ENV), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(max-width: 800px)", ENV), false);
});
test("media: em/rem units", () => {
	assert.equal(ConditionEvaluator.matchesMediaQuery("(min-width: 50em)", { ...ENV, fontSize: 16 }), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(min-width: 70em)", { ...ENV, fontSize: 16 }), false);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(min-width: 64rem)", ENV), true);
});
test("media: resolution", () => {
	assert.equal(ConditionEvaluator.matchesMediaQuery("(min-resolution: 2dppx)", { ...ENV, resolutionDpi: 192 }), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(min-resolution: 300dpi)", { ...ENV, resolutionDpi: 192 }), false);
});
test("media: aspect-ratio", () => {
	assert.equal(ConditionEvaluator.matchesMediaQuery("(min-aspect-ratio: 1/1)", ENV), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(max-aspect-ratio: 1/1)", ENV), false);
});
test("media: prefers-color-scheme", () => {
	assert.equal(ConditionEvaluator.matchesMediaQuery("(prefers-color-scheme: dark)", { ...ENV, colorScheme: "dark" }), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(prefers-color-scheme: dark)", ENV), false);
});
test("media: prefers-reduced-motion", () => {
	assert.equal(ConditionEvaluator.matchesMediaQuery("(prefers-reduced-motion: reduce)", { ...ENV, reducedMotion: true }), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(prefers-reduced-motion: no-preference)", ENV), true);
});
test("media: hover/pointer", () => {
	assert.equal(ConditionEvaluator.matchesMediaQuery("(hover: hover)", { ...ENV, hover: "hover" }), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(pointer: coarse)", { ...ENV, pointer: "coarse" }), true);
	assert.equal(ConditionEvaluator.matchesMediaQuery("(pointer: fine)", { ...ENV, pointer: "coarse" }), false);
});

// ---------------- Expander ----------------
test("expander: margin 1-4 values", () => {
	let out = Expander.expandCssDeclarations({ margin: "10px" });
	assert.equal(out["margin-top"], "10px");
	assert.equal(out["margin-left"], "10px");
	out = Expander.expandCssDeclarations({ margin: "10px 20px" });
	assert.equal(out["margin-top"], "10px");
	assert.equal(out["margin-right"], "20px");
	assert.equal(out["margin-bottom"], "10px");
	assert.equal(out["margin-left"], "20px");
	out = Expander.expandCssDeclarations({ margin: "1px 2px 3px 4px" });
	assert.equal(out["margin-top"], "1px");
	assert.equal(out["margin-right"], "2px");
	assert.equal(out["margin-bottom"], "3px");
	assert.equal(out["margin-left"], "4px");
});
test("expander: padding 3 values", () => {
	const out = Expander.expandCssDeclarations({ padding: "1px 2px 3px" });
	assert.equal(out["padding-top"], "1px");
	assert.equal(out["padding-right"], "2px");
	assert.equal(out["padding-bottom"], "3px");
	assert.equal(out["padding-left"], "2px");
});
test("expander: flex shorthand", () => {
	let out = Expander.expandCssDeclarations({ flex: "2 1 10%" });
	assert.equal(out["flex-grow"], "2");
	assert.equal(out["flex-shrink"], "1");
	assert.equal(out["flex-basis"], "10%");
	out = Expander.expandCssDeclarations({ flex: "none" });
	assert.equal(out["flex-grow"], "0");
	assert.equal(out["flex-basis"], "auto");
	out = Expander.expandCssDeclarations({ flex: "3" });
	assert.equal(out["flex-grow"], "3");
	assert.equal(out["flex-basis"], "0%");
});
test("expander: does not clobber explicit longhands", () => {
	const out = Expander.expandCssDeclarations({ margin: "10px", "margin-top": "5px" });
	assert.equal(out["margin-top"], "5px");
	assert.equal(out["margin-right"], "10px");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
