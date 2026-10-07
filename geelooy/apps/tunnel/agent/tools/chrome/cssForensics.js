// B"H
// Boruch Hashem
// Blessed is He

const { cdpCall } = require("./cdp.js");
const { ready } = require("./extras.js");

/**
 * @file cssForensics.js
 * @description CSS cascade forensics over the existing cdpCall transport.
 * Maps the winning declaration per property (specificity, source file and
 * line, enclosing media queries, origin), resolves custom properties by
 * walking matched rules, and scans for layout conflicts that textual checks
 * cannot see. Uses CDP CSS.getMatchedStylesForNode +
 * CSS.getComputedStyleForNode (+ DOM/Runtime); no parallel CDP system.
 */

function timeoutOf(payload = {}, fallback = 30000) {
	const n = Number(payload.timeoutMs || fallback);
	const max = Number(
		process.env.AWTSMOOS_CHROME_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000
	);
	return Number.isFinite(n)
		? Math.max(1000, Math.min(n, max))
		: fallback;
}

function splitTopLevel(text, delimiter) {
	const parts = [];
	let depth = 0;
	let current = "";
	for (const ch of String(text)) {
		if (ch === "(" || ch === "[") depth++;
		if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
		if (ch === delimiter && depth === 0) {
			parts.push(current);
			current = "";
		} else {
			current += ch;
		}
	}
	parts.push(current);
	return parts;
}

/**
 * Compute the CSS specificity of one selector as [ids, classes, elements].
 * Counts IDs, classes/attribute selectors/pseudo-classes, and type
 * selectors/pseudo-elements. Functional pseudo-classes :not(), :is(),
 * :has() take the max specificity of their arguments; :where() counts 0.
 * @param {string} selector - A single CSS selector (commas are summed, as
 *   each branch of a selector list is evaluated independently).
 * @returns {[number, number, number]} Specificity tuple [a, b, c].
 */
function specificityOf(selector) {
	let a = 0;
	let b = 0;
	let c = 0;
	if (!selector || typeof selector !== "string") return [0, 0, 0];
	let s = String(selector);
	// :where() contributes nothing.
	s = s.replace(/:where\((?:[^()]|\([^()]*\))*\)/gi, "");
	// :not()/:is()/:has()/:matches() take the max of their arguments.
	s = s.replace(
		/:(?:not|is|has|matches)\(((?:[^()]|\([^()]*\))*)\)/gi,
		(match, inner) => {
			let best = [0, 0, 0];
			for (const part of splitTopLevel(inner, ",")) {
				const spec = specificityOf(part.trim());
				if (compareSpecificity(spec, best) > 0) best = spec;
			}
			a += best[0];
			b += best[1];
			c += best[2];
			return " ";
		}
	);
	// Other functional pseudo-classes (e.g. :nth-child(2n)) count once.
	s = s.replace(/:[\w-]+\([^()]*\)/g, () => {
		b += 1;
		return " ";
	});
	const ids = s.match(/#[\w-]+/g);
	if (ids) a += ids.length;
	const classes = s.match(/\.[\w-]+/g);
	if (classes) b += classes.length;
	const attrs = s.match(/\[[^\]]+\]/g);
	if (attrs) b += attrs.length;
	const pseudoElements = s.match(/::[\w-]+/g);
	if (pseudoElements) c += pseudoElements.length;
	s = s.replace(/::[\w-]+/g, " ");
	const legacyPseudo = s.match(
		/:(?:before|after|first-line|first-letter|selection|marker|placeholder|backdrop)\b/gi
	);
	if (legacyPseudo) c += legacyPseudo.length;
	s = s.replace(
		/:(?:before|after|first-line|first-letter|selection|marker|placeholder|backdrop)\b/gi,
		" "
	);
	const pseudoClasses = s.match(/:[\w-]+/g);
	if (pseudoClasses) b += pseudoClasses.length;
	s = s
		.replace(/#[\w-]+/g, " ")
		.replace(/\.[\w-]+/g, " ")
		.replace(/\[[^\]]+\]/g, " ")
		.replace(/:[\w-]+/g, " ");
	const types = s.match(/(^|[\s>+~])([a-zA-Z][\w-]*)/g);
	if (types) c += types.length;
	return [a, b, c];
}

/**
 * Compare two specificity tuples lexicographically.
 * @param {[number,number,number]} x - First specificity.
 * @param {[number,number,number]} y - Second specificity.
 * @returns {number} 1 when x wins, -1 when y wins, 0 when tied.
 */
function compareSpecificity(x, y) {
	for (let i = 0; i < 3; i++) {
		if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
	}
	return 0;
}

function originRank(origin, important) {
	const base =
		origin === "user-agent" ? 0 : origin === "user" ? 1 : 2; // author default
	return important ? base + 3 : base;
}

function cascadeCompare(left, right) {
	const originDelta =
		originRank(left.origin, left.important) -
		originRank(right.origin, right.important);
	if (originDelta !== 0) return originDelta;
	const specDelta = compareSpecificity(left.specificity, right.specificity);
	if (specDelta !== 0) return specDelta;
	return left.order - right.order;
}

/**
 * Resolve the winning declaration for every property from a flat list of
 * candidate declarations, applying the standard cascade: origin and
 * !important outrank specificity, specificity outranks source order.
 * @param {Array<object>} declarations - Candidates shaped
 *   {property, value, important, specificity:[a,b,c], order, origin}.
 * @returns {object} Map of property name to the winning declaration object.
 */
function resolveWinningDeclarations(declarations = []) {
	const winners = {};
	for (const declaration of declarations) {
		if (!declaration || !declaration.property) continue;
		const current = winners[declaration.property];
		if (!current || cascadeCompare(declaration, current) >= 0) {
			winners[declaration.property] = declaration;
		}
	}
	return winners;
}

function selectorTextOf(rule) {
	const list = rule.selectorList;
	if (list) {
		if (Array.isArray(list.selectors) && list.selectors.length) {
			return list.selectors
				.map(entry => String(entry.text || ""))
				.filter(Boolean)
				.join(", ");
		}
		if (typeof list.text === "string" && list.text) return list.text;
	}
	return String(rule.selectorText || "");
}

async function styleSheetUrlMap(timeoutMs) {
	const map = new Map();
	try {
		const all = await cdpCall("CSS.getAllStyleSheets", {}, timeoutMs);
		for (const header of all.headers || []) {
			map.set(header.styleSheetId, String(header.sourceURL || ""));
		}
	} catch (error) {
		// Older targets may not expose the list; source URLs stay blank.
	}
	return map;
}

function sourceOf(rule, sheetMap) {
	const url = sheetMap.get(rule.style && rule.style.styleSheetId) || "";
	const range = rule.style && rule.style.range;
	return {
		sourceUrl: url,
		lineNumber:
			range && Number.isFinite(range.startLine)
				? range.startLine + 1
				: null,
	};
}

function ruleToDeclarations(rule, order, sheetMap) {
	const out = [];
	if (!rule || !rule.style) return out;
	const selectorText = selectorTextOf(rule);
	const specificity = specificityOf(selectorText);
	const source = sourceOf(rule, sheetMap);
	const mediaQueries = (rule.media || [])
		.map(entry => String((entry && entry.text) || ""))
		.filter(Boolean);
	const origin = String(rule.origin || "author");
	for (const prop of rule.style.cssProperties || []) {
		if (!prop || prop.disabled) continue;
		out.push({
			property: prop.name,
			value: prop.value,
			important: Boolean(prop.important),
			specificity,
			order,
			origin,
			selector: selectorText,
			sourceUrl: source.sourceUrl,
			lineNumber: source.lineNumber,
			mediaQueries,
		});
	}
	return out;
}

function collectVarDeclarations(declarations) {
	return declarations
		.filter(declaration => declaration.property.startsWith("--"))
		.slice()
		.sort(cascadeCompare);
}

function makeVarResolver(declarations) {
	const vars = {};
	for (const declaration of collectVarDeclarations(declarations)) {
		vars[declaration.property] = declaration.value;
	}
	const resolveValue = (value, depth = 0) => {
		if (depth > 10 || typeof value !== "string") return value;
		return value.replace(
			/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g,
			(match, name, fallback) => {
				if (Object.prototype.hasOwnProperty.call(vars, name)) {
					return resolveValue(vars[name], depth + 1);
				}
				return fallback !== undefined
					? resolveValue(fallback, depth + 1)
					: match;
			}
		);
	};
	const resolved = {};
	for (const name of Object.keys(vars)) {
		resolved[name] = resolveValue(vars[name]);
	}
	return { vars, resolved, resolveValue };
}

async function nodeIdForSelector(rootNodeId, selector, timeoutMs) {
	const queried = await cdpCall(
		"DOM.querySelector",
		{ nodeId: rootNodeId, selector },
		timeoutMs
	);
	return queried.nodeId || 0;
}

function traceExpression(selector) {
	return (
		"(() => {\n" +
		"  const el = document.querySelector(" +
		JSON.stringify(selector) +
		");\n" +
		"  if (!el) return { found: false };\n" +
		"  const cs = getComputedStyle(el);\n" +
		"  const info = node => {\n" +
		"    const b = node.getBoundingClientRect();\n" +
		"    let sel = node.tagName.toLowerCase();\n" +
		"    if (node.id) { sel += '#' + node.id; }\n" +
		"    else if (node.className && typeof node.className === 'string') {\n" +
		"      const cls = node.className.trim().split(/\\s+/).slice(0, 3).join('.');\n" +
		"      if (cls) sel += '.' + cls;\n" +
		"    }\n" +
		"    return { selector: sel, box: [b.x, b.y, b.width, b.height] };\n" +
		"  };\n" +
		"  const isScrollable = (node, style) =>\n" +
		"    node.scrollHeight > node.clientHeight + 2 &&\n" +
		"    (style.overflowY === 'auto' || style.overflowY === 'scroll');\n" +
		"  const parents = [];\n" +
		"  let scrollOwner = null;\n" +
		"  let p = el.parentElement;\n" +
		"  let depth = 0;\n" +
		"  while (p && depth < 15) {\n" +
		"    parents.push(info(p));\n" +
		"    if (!scrollOwner && isScrollable(p, getComputedStyle(p))) {\n" +
		"      scrollOwner = { selector: info(p).selector, self: false };\n" +
		"    }\n" +
		"    p = p.parentElement;\n" +
		"    depth++;\n" +
		"  }\n" +
		"  if (!scrollOwner && isScrollable(el, cs)) {\n" +
		"    scrollOwner = { selector: info(el).selector, self: true };\n" +
		"  }\n" +
		"  return {\n" +
		"    found: true,\n" +
		"    geometry: {\n" +
		"      scrollWidth: el.scrollWidth,\n" +
		"      clientWidth: el.clientWidth,\n" +
		"      scrollHeight: el.scrollHeight,\n" +
		"      clientHeight: el.clientHeight\n" +
		"    },\n" +
		"    computed: {\n" +
		"      display: cs.display,\n" +
		"      position: cs.position,\n" +
		"      overflowX: cs.overflowX,\n" +
		"      overflowY: cs.overflowY,\n" +
		"      width: cs.width,\n" +
		"      height: cs.height\n" +
		"    },\n" +
		"    parentBoxes: parents,\n" +
		"    scrollOwner: scrollOwner,\n" +
		"    innerWidth: window.innerWidth,\n" +
		"    innerHeight: window.innerHeight\n" +
		"  };\n" +
		"})()"
	);
}

function scanExpression(scopeSelector) {
	return (
		"(() => {\n" +
		"  const root = document.querySelector(" +
		JSON.stringify(scopeSelector) +
		") || document.body;\n" +
		"  const pathSel = node => {\n" +
		"    const parts = [];\n" +
		"    let n = node;\n" +
		"    let depth = 0;\n" +
		"    while (n && n.nodeType === 1 && depth < 4) {\n" +
		"      let part = n.tagName.toLowerCase();\n" +
		"      if (n.id) { part += '#' + n.id; parts.unshift(part); break; }\n" +
		"      const cls = (typeof n.className === 'string' ? n.className : '')\n" +
		"        .trim().split(/\\s+/).filter(Boolean).slice(0, 2);\n" +
		"      if (cls.length) part += '.' + cls.join('.');\n" +
		"      parts.unshift(part);\n" +
		"      n = n.parentElement;\n" +
		"      depth++;\n" +
		"    }\n" +
		"    return parts.join(' > ');\n" +
		"  };\n" +
		"  const els = [root, ...root.querySelectorAll('*')].slice(0, 3000);\n" +
		"  const items = els.map(el => {\n" +
		"    const cs = getComputedStyle(el);\n" +
		"    const b = el.getBoundingClientRect();\n" +
		"    return {\n" +
		"      selector: pathSel(el),\n" +
		"      tag: el.tagName.toLowerCase(),\n" +
		"      rect: { x: b.x, y: b.y, w: b.width, h: b.height,\n" +
		"              left: b.left, right: b.right, top: b.top, bottom: b.bottom },\n" +
		"      scrollW: el.scrollWidth, clientW: el.clientWidth,\n" +
		"      scrollH: el.scrollHeight, clientH: el.clientHeight,\n" +
		"      overflowX: cs.overflowX, overflowY: cs.overflowY,\n" +
		"      position: cs.position, display: cs.display, zIndex: cs.zIndex\n" +
		"    };\n" +
		"  });\n" +
		"  return {\n" +
		"    found: true,\n" +
		"    scopeUsed: root === document.body && " +
		JSON.stringify(scopeSelector) +
		" !== 'body' ? 'body(fallback)' : " +
		JSON.stringify(scopeSelector) +
		",\n" +
		"    itemCount: items.length,\n" +
		"    items: items,\n" +
		"    innerWidth: window.innerWidth,\n" +
		"    innerHeight: window.innerHeight,\n" +
		"    links: [...document.querySelectorAll('link[rel~=stylesheet]')]\n" +
		"      .map(l => l.href).filter(Boolean),\n" +
		"    sheets: [...document.styleSheets].map(s => s.href).filter(Boolean)\n" +
		"  };\n" +
		"})()"
	);
}

/**
 * Trace the CSS cascade for the first element matching a selector.
 * @param {object} payload - {targetId, selector, properties?, port?,
 *   timeoutMs?, ...targetOptions passthrough}.
 * @param {string} payload.targetId - Chrome target id (pageId /
 *   chromeTargetId also accepted, matching targetOptions).
 * @param {string} payload.selector - CSS selector; the first match is traced.
 * @param {string[]} [payload.properties] - Properties to report; when omitted
 *   every winning declaration is reported.
 * @returns {Promise<object>} {selector, boundingBox, parentBoxes[], geometry,
 *   computed, winningDeclarations[], cssVariables, scrollOwner,
 *   viewportOwners}.
 */
async function traceCascade(payload = {}) {
	const selector = String(payload.selector || "");
	if (!selector) throw new Error("traceCascade requires a selector");
	await ready(payload);
	const timeoutMs = timeoutOf(payload, 30000);
	const doc = await cdpCall("DOM.getDocument", { depth: 0 }, timeoutMs);
	const rootNodeId = doc.root && doc.root.nodeId;
	if (!rootNodeId) throw new Error("DOM.getDocument returned no root");
	const nodeId = await nodeIdForSelector(rootNodeId, selector, timeoutMs);
	if (!nodeId) {
		throw new Error(`selector matched no element: ${selector}`);
	}
	try {
		await cdpCall("CSS.enable", {}, timeoutMs);
	} catch (error) {
		// Non-fatal: matched-style calls still work on most targets.
	}
	const sheetMap = await styleSheetUrlMap(timeoutMs);
	const matched = await cdpCall(
		"CSS.getMatchedStylesForNode",
		{ nodeId },
		timeoutMs
	);
	const computed = await cdpCall(
		"CSS.getComputedStyleForNode",
		{ nodeId },
		timeoutMs
	);
	const declarations = [];
	(matched.matchedCSSRules || []).forEach((entry, index) => {
		declarations.push(
			...ruleToDeclarations(entry && entry.rule, index, sheetMap)
		);
	});
	const inline = matched.inlineStyle;
	if (inline) {
		const range = inline.range || {};
		for (const prop of inline.cssProperties || []) {
			if (!prop || prop.disabled) continue;
			declarations.push({
				property: prop.name,
				value: prop.value,
				important: Boolean(prop.important),
				specificity: [1, 0, 0],
				order: Number.MAX_SAFE_INTEGER,
				origin: "author",
				selector: "(inline style)",
				sourceUrl: "",
				lineNumber: Number.isFinite(range.startLine)
					? range.startLine + 1
					: null,
				mediaQueries: [],
			});
		}
	}
	const winners = resolveWinningDeclarations(declarations);
	const computedMap = {};
	for (const entry of (computed && computed.computedStyle) || []) {
		computedMap[entry.name] = entry.value;
	}
	const wanted =
		Array.isArray(payload.properties) && payload.properties.length
			? payload.properties.map(String)
			: Object.keys(winners);
	const varResolver = makeVarResolver(declarations);
	const winningDeclarations = wanted
		.filter(property => winners[property])
		.map(property => ({
			property,
			value: winners[property].value,
			resolvedValue: varResolver.resolveValue(winners[property].value),
			selector: winners[property].selector,
			specificity: winners[property].specificity,
			sourceUrl: winners[property].sourceUrl,
			lineNumber: winners[property].lineNumber,
			mediaQueries: winners[property].mediaQueries,
			origin: winners[property].origin,
			important: winners[property].important,
			computedValue:
				computedMap[property] !== undefined
					? computedMap[property]
					: null,
		}));
	let boxModel = null;
	try {
		const boxed = await cdpCall("DOM.getBoxModel", { nodeId }, timeoutMs);
		if (boxed && boxed.model) {
			boxModel = {
				content: boxed.model.content,
				padding: boxed.model.padding,
				border: boxed.model.border,
				margin: boxed.model.margin,
				width: boxed.model.width,
				height: boxed.model.height,
			};
		}
	} catch (error) {
		// Non-rendered nodes (e.g. display:none) have no box model.
	}
	const evaluated = await cdpCall(
		"Runtime.evaluate",
		{ expression: traceExpression(selector), returnByValue: true },
		timeoutMs
	);
	const page = (evaluated.result && evaluated.result.value) || {};
	if (!page.found) {
		throw new Error(
			`selector matched in DOM but not in page: ${selector}`
		);
	}
	const viewportOwners = await viewportHeightOwners(
		rootNodeId,
		sheetMap,
		timeoutMs
	);
	return {
		selector,
		boundingBox: boxModel,
		parentBoxes: page.parentBoxes || [],
		geometry: page.geometry || {},
		computed: page.computed || {},
		winningDeclarations,
		cssVariables: varResolver.resolved,
		scrollOwner: page.scrollOwner || null,
		viewportOwners,
		innerWidth: page.innerWidth,
		innerHeight: page.innerHeight,
	};
}

const VIEWPORT_UNIT_RE = /100\s*(?:v[hw]|dv[hw]|sv[hw]|lv[hw])/i;
const VIEWPORT_SIZED_PROPS = new Set([
	"height",
	"min-height",
	"max-height",
	"width",
	"min-width",
	"max-width",
]);

/**
 * Collect rules that set viewport-height units on html / body / :root.
 * @param {number} rootNodeId - DOM root node id.
 * @param {Map} sheetMap - styleSheetId to source URL map.
 * @param {number} timeoutMs - CDP timeout.
 * @returns {Promise<Array<object>>} Owner entries {selector, property, value,
 *   specificity, sourceUrl, lineNumber}.
 */
async function viewportHeightOwners(rootNodeId, sheetMap, timeoutMs) {
	const owners = [];
	for (const container of ["html", "body"]) {
		const nodeId = await nodeIdForSelector(
			rootNodeId,
			container,
			timeoutMs
		).catch(() => 0);
		if (!nodeId) continue;
		const matched = await cdpCall(
			"CSS.getMatchedStylesForNode",
			{ nodeId },
			timeoutMs
		).catch(() => null);
		if (!matched) continue;
		const declarations = [];
		(matched.matchedCSSRules || []).forEach((entry, index) => {
			declarations.push(
				...ruleToDeclarations(entry && entry.rule, index, sheetMap)
			);
		});
		for (const declaration of declarations) {
			if (
				VIEWPORT_SIZED_PROPS.has(declaration.property) &&
				VIEWPORT_UNIT_RE.test(String(declaration.value))
			) {
				owners.push({
					container,
					selector: declaration.selector,
					property: declaration.property,
					value: declaration.value,
					specificity: declaration.specificity,
					sourceUrl: declaration.sourceUrl,
					lineNumber: declaration.lineNumber,
				});
			}
		}
	}
	return owners;
}

function rectsIntersect(a, b) {
	if (!a || !b) return false;
	return (
		a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
	);
}

/**
 * Classify one element's metrics for clipped hidden content.
 * @param {object} m - Metric {selector, overflowY, scrollH, clientH}.
 * @returns {object|null} HIGH hidden-content finding, or null.
 */
function classifyHiddenContent(m = {}) {
	if (
		(m.overflowY === "hidden" || m.overflowY === "clip") &&
		Number(m.scrollH) > Number(m.clientH) + 2
	) {
		return {
			severity: "HIGH",
			kind: "hidden-content",
			selector: m.selector || "",
			detail:
				`overflow-y:${m.overflowY} clips ` +
				`${Math.round(m.scrollH - m.clientH)}px of ` +
				`${Math.round(m.scrollH)}px scroll height`,
		};
	}
	return null;
}

/**
 * Classify one element's metrics for horizontal overflow past the viewport.
 * @param {object} m - Metric {selector, display, rect:{left,right,w,h}}.
 * @param {number} innerWidth - Viewport innerWidth in CSS px.
 * @returns {object|null} HIGH horizontal-overflow finding, or null.
 */
function classifyHorizontalOverflow(m = {}, innerWidth = 0) {
	if (m.display === "none") return null;
	const rect = m.rect || {};
	if (!(rect.w > 0 || rect.h > 0)) return null;
	if (Number(rect.right) > Number(innerWidth) + 2) {
		return {
			severity: "HIGH",
			kind: "horizontal-overflow",
			selector: m.selector || "",
			detail:
				`right edge at ${Math.round(rect.right)}px exceeds ` +
				`viewport width ${Math.round(innerWidth)}px by ` +
				`${Math.round(rect.right - innerWidth)}px`,
		};
	}
	if (Number(rect.left) < -2) {
		return {
			severity: "HIGH",
			kind: "horizontal-overflow",
			selector: m.selector || "",
			detail:
				`left edge at ${Math.round(rect.left)}px starts ` +
				`${Math.round(-rect.left)}px before the viewport`,
		};
	}
	return null;
}

/**
 * Classify a fixed/sticky element against primary content boxes.
 * @param {object} m - Metric {selector, position, rect}.
 * @param {Array<object>} primaryBoxes - Content boxes {selector, rect}.
 * @returns {object|null} MED fixed-sticky-intersection finding, or null.
 */
function classifyFixedSticky(m = {}, primaryBoxes = []) {
	if (m.position !== "fixed" && m.position !== "sticky") return null;
	const hit = (primaryBoxes || []).find(entry =>
		rectsIntersect(m.rect, entry.rect)
	);
	if (hit) {
		return {
			severity: "MED",
			kind: "fixed-sticky-intersection",
			selector: m.selector || "",
			detail:
				`${m.position} element intersects primary content box` +
				(hit.selector ? ` ${hit.selector}` : ""),
		};
	}
	return null;
}

/**
 * Classify competing viewport-height authorities on html/body/:root.
 * @param {Array<object>} authorities - Owner entries from
 *   viewportHeightOwners().
 * @returns {object|null} HIGH competing-viewport-height finding, or null.
 */
function classifyViewportAuthorities(authorities = []) {
	const seen = new Map();
	for (const entry of authorities || []) {
		const key = `${entry.selector}@@${entry.sourceUrl}@@${entry.lineNumber}`;
		if (!seen.has(key)) seen.set(key, entry);
	}
	if (seen.size >= 2) {
		const list = [...seen.values()]
			.map(
				entry =>
					`${entry.selector} { ${entry.property}: ${entry.value} }` +
					(entry.sourceUrl
						? ` (${entry.sourceUrl}${
								entry.lineNumber
									? `:${entry.lineNumber}`
									: ""
						  })`
						: "")
			)
			.join("; ");
		return {
			severity: "HIGH",
			kind: "competing-viewport-height",
			selector: "html, body",
			detail: `${seen.size} distinct rules set viewport-height units: ${list}`,
		};
	}
	return null;
}

/**
 * Classify stylesheet <link> refs missing from document.styleSheets.
 * @param {string[]} linkHrefs - Hrefs of link[rel~=stylesheet] elements.
 * @param {string[]} sheetHrefs - Hrefs present in document.styleSheets.
 * @returns {Array<object>} LOW dead-stylesheet findings.
 */
function classifyDeadStylesheets(linkHrefs = [], sheetHrefs = []) {
	const live = new Set(sheetHrefs || []);
	return (linkHrefs || [])
		.filter(href => !live.has(href))
		.map(href => ({
			severity: "LOW",
			kind: "dead-stylesheet",
			selector: `link[href="${href}"]`,
			detail:
				`stylesheet link ${href} is absent from ` +
				`document.styleSheets (failed load, wrong MIME, or blocked)`,
		}));
}

/**
 * Scan a scope for CSS layout conflicts: hidden content, horizontal
 * overflow, fixed/sticky intersections, competing viewport-height
 * authorities, and dead stylesheet references.
 * @param {object} payload - {targetId, scopeSelector?, port?, timeoutMs?,
 *   ...targetOptions passthrough}.
 * @param {string} [payload.scopeSelector='body'] - Subtree to scan.
 * @returns {Promise<Array<object>>} findings[] each {severity:'HIGH'|'MED'|
 *   'LOW', kind, selector, detail}.
 */
async function scanConflicts(payload = {}) {
	const scopeSelector = String(payload.scopeSelector || "body");
	await ready(payload);
	const timeoutMs = timeoutOf(payload, 30000);
	const evaluated = await cdpCall(
		"Runtime.evaluate",
		{ expression: scanExpression(scopeSelector), returnByValue: true },
		timeoutMs
	);
	const data = (evaluated.result && evaluated.result.value) || {};
	if (!data.found) {
		throw new Error("scanConflicts could not evaluate the page");
	}
	const findings = [];
	const items = data.items || [];
	for (const item of items) {
		const hidden = classifyHiddenContent(item);
		if (hidden) findings.push(hidden);
		const overflow = classifyHorizontalOverflow(item, data.innerWidth);
		if (overflow) findings.push(overflow);
	}
	const viewportArea = data.innerWidth * data.innerHeight;
	const primaryBoxes = items
		.filter(
			item =>
				item.position !== "fixed" &&
				item.position !== "sticky" &&
				item.display !== "none" &&
				item.rect.w * item.rect.h >= viewportArea * 0.1
		)
		.map(item => ({ selector: item.selector, rect: item.rect }));
	for (const item of items) {
		const hit = classifyFixedSticky(item, primaryBoxes);
		if (hit) findings.push(hit);
	}
	const doc = await cdpCall("DOM.getDocument", { depth: 0 }, timeoutMs);
	const rootNodeId = doc.root && doc.root.nodeId;
	if (rootNodeId) {
		try {
			await cdpCall("CSS.enable", {}, timeoutMs);
		} catch (error) {
			// Non-fatal.
		}
		const sheetMap = await styleSheetUrlMap(timeoutMs);
		const authorities = await viewportHeightOwners(
			rootNodeId,
			sheetMap,
			timeoutMs
		);
		const competing = classifyViewportAuthorities(authorities);
		if (competing) findings.push(competing);
	}
	for (const dead of classifyDeadStylesheets(data.links, data.sheets)) {
		findings.push(dead);
	}
	return findings;
}

/**
 * Action handler for later registration as chromeCssForensics. Do not edit
 * agent/tools/chrome/index.js from here; the coordinator registers it.
 * @param {object} payload - {mode:'trace'|'scan', ...traceCascade/scanConflicts payload}.
 * @returns {Promise<object>} {ok, report} for trace, {ok, findings} for scan,
 *   or {ok:false, error, ...} envelopes.
 */
async function chromeCssForensics(payload = {}) {
	const mode = String(
		payload.mode || (payload.selector ? "trace" : "scan")
	).toLowerCase();
	try {
		if (mode === "trace") {
			if (!payload.selector) {
				return {
					ok: false,
					action: "chromeCssForensics",
					error: "missing_selector",
					detail: "trace mode requires payload.selector",
				};
			}
			const report = await traceCascade(payload);
			return {
				ok: true,
				action: "chromeCssForensics",
				mode: "trace",
				report,
			};
		}
		if (mode === "scan") {
			const findings = await scanConflicts(payload);
			return {
				ok: true,
				action: "chromeCssForensics",
				mode: "scan",
				findings,
			};
		}
		return {
			ok: false,
			action: "chromeCssForensics",
			error: "unknown_mode",
			detail: mode,
		};
	} catch (error) {
		return {
			ok: false,
			action: "chromeCssForensics",
			error: "chrome_css_forensics_failed",
			detail: error && error.message ? error.message : String(error),
		};
	}
}

module.exports = {
	traceCascade,
	scanConflicts,
	chromeCssForensics,
	specificityOf,
	compareSpecificity,
	resolveWinningDeclarations,
	classifyHiddenContent,
	classifyHorizontalOverflow,
	classifyFixedSticky,
	classifyViewportAuthorities,
	classifyDeadStylesheets,
};
