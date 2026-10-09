//B"H
//Boruch Hashem
//Blessed be He

{
const { parseCssDeclarations } = (typeof module === "object" && module.exports ? require("./CssDeclarationParser.js") : globalThis.Merkava);
const { parseCssRules } = (typeof module === "object" && module.exports ? require("./CssRuleParser.js") : globalThis.Merkava);
const { splitSelectorList } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
const { cssSpecificity } = (typeof module === "object" && module.exports ? require("./CssSpecificity.js") : globalThis.Merkava);
const conditions = (typeof module === "object" && module.exports ? require("./CssConditionEvaluator.js") : globalThis.Merkava);

/** Compiles parsed CSS into immutable author rules with deterministic source order. */
function compileCssStyleSheet(source, environment = {}, orderStart = 0) {
	const state = { environment, order: orderStart, rules: [], atRules: [], containerRules: [] };
	compileRuleList(parseCssRules(source), state);
	return Object.freeze({
		atRules: Object.freeze(state.atRules),
		nextOrder: state.order,
		rules: Object.freeze(state.rules),
		// B"H 2026-10-09: @container rules — evaluated per-element at
		// cascade time against the query container's size (not at
		// compile time, since container sizes aren't known yet).
		containerRules: Object.freeze(state.containerRules)
	});
}

function compileRuleList(parsedRules, state) {
	for (const rule of parsedRules) {
		if (rule.kind === "qualified") {
			compileQualifiedRule(rule, state);
			continue;
		}
		compileAtRule(rule, state);
	}
}

function compileQualifiedRule(rule, state) {
	const declarations = Object.freeze(parseCssDeclarations(rule.block));
	for (const selector of splitSelectorList(rule.prelude)) {
		state.rules.push(Object.freeze({
			declarations,
			order: state.order,
			selector,
			specificity: Object.freeze([0, ...cssSpecificity(selector)])
		}));
		state.order += 1;
	}
}

function compileAtRule(rule, state) {
	state.atRules.push(rule);
	if (!rule.block) return;
	if (rule.name === "layer") {
		compileRuleList(parseCssRules(rule.block), state);
		return;
	}
	if (rule.name === "media" && conditions.matchesMediaQuery(rule.prelude, state.environment)) {
		compileRuleList(parseCssRules(rule.block), state);
		return;
	}
	if (rule.name === "supports" && conditions.matchesSupportsCondition(rule.prelude, state.environment)) {
		compileRuleList(parseCssRules(rule.block), state);
		return;
	}
	// B"H 2026-10-09: @container — parse the prelude (optional name +
	// condition) and inner rules; evaluation is deferred to cascade time
	// when the query container's size is known. Nested @container inside
	// @media works because this runs after the media check above.
	if (rule.name === "container" && rule.block) {
		const parsed = parseContainerPrelude(rule.prelude);
		const innerState = { environment: state.environment, order: state.order, rules: [], atRules: [], containerRules: [] };
		compileRuleList(parseCssRules(rule.block), innerState);
		state.order = innerState.order;
		if (innerState.rules.length) {
			state.containerRules.push(Object.freeze({
				name: parsed.name,
				condition: parsed.condition,
				rules: Object.freeze(innerState.rules)
			}));
		}
		return;
	}
}

// B"H 2026-10-09: parse `@container <name>? (<condition>)` prelude into
// {name, condition}. Handles `style(--x: v)` queries too.
function parseContainerPrelude(prelude) {
	const text = String(prelude || "").trim();
	// style query: @container style(--theme: dark)
	const styleMatch = text.match(/^style\s*\(([\s\S]*)\)$/i);
	if (styleMatch) return { name: null, condition: { kind: "style", query: styleMatch[1].trim() } };
	// named: @container card (min-width: 300px) — name is a leading ident,
	// the rest must start a condition ("(" or "not").
	const namedMatch = text.match(/^([a-zA-Z][\w-]*)\s+([\s\S]+)$/);
	if (namedMatch && !/^(and|or|not|style)$/i.test(namedMatch[1])) {
		const rest = namedMatch[2].trim();
		if (rest.startsWith("(") || /^not\s/i.test(rest)) {
			return { name: namedMatch[1].toLowerCase(), condition: parseSizeCondition(rest) };
		}
	}
	// unnamed: the whole prelude is the condition (single or compound).
	return { name: null, condition: parseSizeCondition(text) };
}

// Parse (min-width: 400px) / (max-width: ...) / (min-height: ...) etc.
// B"H: also handles compound `not`, `and`, `or` conditions.
function parseSizeCondition(text) {
  const t = String(text || "").trim();
  // not <cond>
  let m = t.match(/^not\s+([\s\S]+)$/i);
  if (m) {
    const inner = parseSizeCondition(m[1].trim());
    return inner ? { kind: "not", cond: inner } : null;
  }
  // top-level and/or: "(a) and (b)", "(a) or (b) or (c)"
  const parts = splitBoolTopLevel(t);
  if (parts.length > 1) {
    const conds = [], ops = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const c = parseSizeCondition(parts[i]);
        if (!c) return null;
        conds.push(c);
      } else ops.push(parts[i].toLowerCase());
    }
    return { kind: "bool", ops, conds };
  }
  // single: "(min-width: 400px)" or bare "min-width: 400px"
  const inner = t.match(/^\(([\s\S]*)\)$/);
  const core = inner ? inner[1].trim() : t;
  m = core.match(/^(min-|max-)?(width|height)\s*:\s*(\d+(?:\.\d+)?)\s*(px|em|rem|vw|vh|%)?$/i);
  if (!m) return null;
  return { kind: "size", prop: m[2].toLowerCase(), op: m[1] ? m[1].toLowerCase() : "", value: Number(m[3]), unit: (m[4] || "px").toLowerCase() };
}

// Split text on top-level "and"/"or" (paren-depth 0). Returns
// [cond, op, cond, op, cond...] or [text] when no top-level operator.
function splitBoolTopLevel(text) {
  const out = [];
  let depth = 0, last = 0, i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0) {
      const mm = text.slice(i).match(/^\s+(and|or)\s+/i);
      if (mm) {
        out.push(text.slice(last, i));
        out.push(mm[1]);
        i += mm[0].length;
        last = i;
        continue;
      }
    }
    i++;
  }
  out.push(text.slice(last));
  return out;
}

/** Compiles a programmatically added declaration object into cascade entries. */
function declarationsFromObject(declarations) {
	return Object.freeze(Object.entries(declarations || {}).map(([rawName, value]) => {
		const key = String(rawName);
		return Object.freeze({
			important: false,
			name: key.startsWith("--") ? key : key.toLowerCase(),
			value: String(value)
		});
	}));
}

const AwtsExports = { compileCssStyleSheet, declarationsFromObject };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
