//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file The Explainer — why is it beautiful?
 * @description Takes a design (constraint source + solved values) and produces
 * human-readable explanations for every choice. No jargon: "The title is 64px
 * because the design requires 4× the body size (16px)."
 *
 * Each explanation traces the exact constraint that produced the value, and
 * for measurable rules (contrast) reports what was required versus achieved.
 */

import { parse } from "../constraints/parser.mjs";
import { validate } from "../constraints/validator.mjs";
import { solve, valuesToObject, contrastRatio } from "../constraints/solver.mjs";
import { getBundle } from "../constraints/library.mjs";

/** Turn a dotted path into friendly words: "title.fontSize" → "the title font size". */
export function pathToWords(path) {
	const humanize = (s) =>
		s
			.replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase → words
			.replace(/[_-]+/g, " ")
			.toLowerCase();
	return "the " + path.split(".").map(humanize).join(" ");
}

/** Turn an AST expression node into plain-language words. */
export function exprToWords(node) {
	if (!node) return "nothing";
	switch (node.type) {
		case "path":
			return pathToWords(node.parts.join("."));
		case "number":
			return String(node.value);
		case "dimension":
			return `${node.value}${node.unit}`;
		case "color":
			return node.hex;
		case "string":
			return `"${node.value}"`;
		case "keyword":
			return node.value;
		case "binary": {
			const opWords = { "+": "plus", "-": "minus", "*": "×", "/": "÷" };
			return `${exprToWords(node.left)} ${opWords[node.op] || node.op} ${exprToWords(node.right)}`;
		}
		case "unary":
			return `${node.op}${exprToWords(node.operand)}`;
		case "call": {
			const args = node.args.map((a) => (a.type === "path" ? pathToWords(a.parts.join(".")) : exprToWords(a)));
			if (node.name === "contrast") return `the contrast between ${args.join(" and ")}`;
			if (node.name === "luminance") return `the brightness of ${args.join(", ")}`;
			if (node.name === "darken") return `${args[0]} darkened by ${args[1]}`;
			if (node.name === "lighten") return `${args[0]} lightened by ${args[1]}`;
			if (node.name === "below") return `${args[0]} placed below ${args[1]}`;
			if (node.name === "above") return `${args[0]} placed above ${args[1]}`;
			if (node.name === "beside") return `${args[0]} placed beside ${args[1]}`;
			return `${node.name} of ${args.join(", ")}`;
		}
		case "range":
			return `between ${exprToWords(node.min)} and ${exprToWords(node.max)}`;
		default:
			return "a design rule";
	}
}

/** Collect all path references inside an expression node. */
function collectPaths(node, out = []) {
	if (!node) return out;
	if (node.type === "path") out.push(node.parts.join("."));
	else if (node.type === "binary") {
		collectPaths(node.left, out);
		collectPaths(node.right, out);
	} else if (node.type === "unary") collectPaths(node.operand, out);
	else if (node.type === "call") node.args.forEach((a) => collectPaths(a, out));
	else if (node.type === "range") {
		collectPaths(node.min, out);
		collectPaths(node.max, out);
	}
	return out;
}

/**
 * Explain a solved design in plain language.
 * @param {string} src Constraint DSL source.
 * @param {Object} opts {bundles: [names]} — library bundles included, so the
 *   explainer can name them as the source of rules.
 * @returns {{ok, errors, explanations: [{path, value, text, rule}], headline}}
 */
export function explain(src, opts = {}) {
	let ast;
	try {
		ast = parse(src);
	} catch (e) {
		return { ok: false, errors: [`Parse error: ${e.message}`], explanations: [], headline: "" };
	}
	const validation = validate(ast);
	if (!validation.ok) {
		return {
			ok: false,
			errors: validation.errors.map((e) => `Line ${e.line ?? "?"}: ${e.message}`),
			explanations: [],
			headline: "",
		};
	}
	const solution = solve(ast);
	if (!solution.ok) {
		return { ok: false, errors: solution.errors, explanations: [], headline: "" };
	}
	const values = solution.values; // Map of dotted -> internal value objects
	const display = valuesToObject(values);
	const bundleNote =
		opts.bundles && opts.bundles.length
			? ` It draws on the ${opts.bundles.map((b) => `"${b}"`).join(", ")} design bundles.`
			: "";

	const explanations = [];
	const declared = new Set(); // paths with '=' declarations

	for (const stmt of ast.statements) {
		if (stmt.type !== "constraint") continue;
		const subjectWords = exprToWords(stmt.subject);
		if (stmt.op === "=" && stmt.target) {
			const path = stmt.target.parts.join(".");
			declared.add(path);
			const value = display[path] ?? "(derived)";
			const refs = collectPaths(stmt.value).filter((p) => p !== path);
			const refText =
				refs.length > 0
					? ", where " +
					  refs
							.map((p) => `${pathToWords(p)} is ${display[p] ?? "unsolved"}`)
							.join(" and ")
					: "";
			explanations.push({
				path,
				value,
				rule: `${path} = ${astToSource(stmt.value)}`,
				text: `The ${subjectWords.replace(/^the /, "")} is ${value}, because the design declares it as ${exprToWords(stmt.value)}${refText}.`,
			});
		} else if (stmt.subject && stmt.subject.type === "call" && stmt.subject.name === "contrast") {
			const [a, b] = stmt.subject.args;
			const ap = a.type === "path" ? a.parts.join(".") : null;
			const bp = b.type === "path" ? b.parts.join(".") : null;
			const va = ap ? values.get(ap) : null;
			const vb = bp ? values.get(bp) : null;
			let achieved = null;
			if (va && vb && va.kind === "color" && vb.kind === "color") {
				achieved = contrastRatio(va.rgb, vb.rgb);
			}
			const required = stmt.value && stmt.value.type === "number" ? stmt.value.value : exprToWords(stmt.value);
			const verb = { ">=": "at least", "<=": "at most", ">": "more than", "<": "less than" }[stmt.op] || stmt.op;
			let text = `The design requires ${subjectWords} to be ${verb} ${required}.`;
			if (achieved !== null) {
				const margin = achieved - Number(required);
				text += ` It achieves ${achieved.toFixed(2)} — ${
					margin >= 0 ? `comfortably passing by ${margin.toFixed(2)}` : `FAILING by ${(-margin).toFixed(2)}`
				}. This is what keeps text readable instead of washed out.`;
			}
			explanations.push({ path: null, value: achieved !== null ? achieved.toFixed(2) : null, rule: astToSource(stmt), text });
		} else if (stmt.target) {
			const path = stmt.target.parts.join(".");
			const value = display[path] ?? "(derived)";
			explanations.push({
				path,
				value,
				rule: astToSource(stmt),
				text: `The ${subjectWords.replace(/^the /, "")} is ${value}, because the design requires ${subjectWords} ${stmt.op} ${exprToWords(stmt.value)}.`,
			});
		}
	}

	// Note any solved values not directly declared (derived through chains).
	for (const [path, value] of Object.entries(display)) {
		if (!declared.has(path) && !explanations.some((e) => e.path === path)) {
			explanations.push({
				path,
				value,
				rule: "(derived)",
				text: `The ${pathToWords(path).replace(/^the /, "")} settles at ${value} through the chain of rules above.`,
			});
		}
	}

	const headline = `This design makes ${Object.keys(display).length} decisions, each one traceable to a declared rule.${bundleNote}`;
	return { ok: true, errors: [], explanations, headline };
}

/** Render one constraint statement back as compact source. */
function astToSource(stmt) {
	if (stmt.type !== "constraint") return "";
	const subj = stmt.subject ? exprSource(stmt.subject) : "";
	const val = stmt.value ? exprSource(stmt.value) : "";
	return `${subj} ${stmt.op} ${val}`.trim();
}

function exprSource(node) {
	if (!node) return "";
	switch (node.type) {
		case "path":
			return node.parts.join(".");
		case "number":
			return String(node.value);
		case "dimension":
			return `${node.value}${node.unit}`;
		case "color":
			return node.hex;
		case "string":
			return `"${node.value}"`;
		case "keyword":
			return node.value;
		case "binary":
			return `${exprSource(node.left)} ${node.op} ${exprSource(node.right)}`;
		case "unary":
			return `${node.op}${exprSource(node.operand)}`;
		case "call":
			return `${node.name}(${node.args.map(exprSource).join(", ")})`;
		case "range":
			return `[${exprSource(node.min)}..${exprSource(node.max)}]`;
		default:
			return "?";
	}
}

/**
 * Explain one specific value: "Why is the title 64px?"
 * @returns {string} Plain-language answer, or a "not found" message.
 */
export function whyValue(src, dottedPath, opts = {}) {
	const result = explain(src, opts);
	if (!result.ok) return `I could not solve the design: ${result.errors[0] || "unknown error"}.`;
	const hit = result.explanations.find((e) => e.path === dottedPath);
	if (hit) return hit.text;
	const partial = result.explanations.filter(
		(e) => e.path && (e.path.startsWith(dottedPath + ".") || dottedPath.startsWith(e.path + "."))
	);
	if (partial.length) {
		return (
			`I found no rule naming exactly "${dottedPath}", but these are close:\n` +
			partial.map((p) => `- ${p.text}`).join("\n")
		);
	}
	return `Nothing in this design decides "${dottedPath}". It may come from a bundle or be left to the browser.`;
}

/** Describe a library bundle in one line, for citations. */
export function describeBundle(name) {
	try {
		const src = getBundle(name);
		const first = src.split("\n").find((l) => l.trim() && !l.trim().startsWith("//"));
		return { name, source: src, example: first ? first.trim() : "" };
	} catch {
		return null;
	}
}
