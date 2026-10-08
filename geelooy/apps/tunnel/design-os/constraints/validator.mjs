//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Validator for the Awtsmoos Design OS constraint language.
 * @description Checks a parsed constraint program for satisfiability problems BEFORE
 * solving: contradictory assignments, impossible ranges, and type errors. A program
 * that fails validation can never be solved, so the solver refuses it outright.
 *
 * Checks:
 *  1. Duplicate assignment: `x = 1` and `x = 2` (different constants) → conflict.
 *  2. Range contradiction: `x in [1,5]` with `x = 10` → impossible.
 *  3. Bound contradiction: `x >= 5` with `x <= 3` → impossible.
 *  4. Type errors: arithmetic on colors/keywords, contrast() on non-colors.
 *  5. Unknown function names.
 *  6. Self-reference: `x = x + 1` → unresolvable.
 */

import { astToString } from "./parser.mjs";

/** Functions known to the language, with arity and argument kinds. */
export const KNOWN_FUNCTIONS = Object.freeze({
	contrast: { arity: 2, args: ["color", "color"], returns: "number" },
	below: { arity: 1, args: ["any"], returns: "position" },
	above: { arity: 1, args: ["any"], returns: "position" },
	beside: { arity: 1, args: ["any"], returns: "position" },
	darken: { arity: 2, args: ["color", "number"], returns: "color" },
	lighten: { arity: 2, args: ["color", "number"], returns: "color" },
	mix: { arity: 3, args: ["color", "color", "number"], returns: "color" },
	min: { arity: 2, args: ["number", "number"], returns: "number" },
	max: { arity: 2, args: ["number", "number"], returns: "number" },
	clamp: { arity: 3, args: ["number", "number", "number"], returns: "number" },
	abs: { arity: 1, args: ["number"], returns: "number" },
	round: { arity: 1, args: ["number"], returns: "number" },
	luminance: { arity: 1, args: ["color"], returns: "number" },
});

/**
 * Validates a parsed program.
 * @param {{type:"program",statements:Array}} program AST from parser.
 * @returns {{ok:boolean, errors:Array<{message:string,line:number|null}>}}
 */
export function validate(program) {
	const errors = [];
	const v = new Validator(errors);
	v.run(program);
	return { ok: errors.length === 0, errors };
}

class Validator {
	constructor(errors) {
		this.errors = errors;
		// target key -> list of {op, valueNode, line}
		this.assignments = new Map();
	}

	err(message, line = null) {
		this.errors.push({ message, line });
	}

	run(program) {
		for (const stmt of program.statements) {
			this.checkConstraint(stmt);
		}
		this.checkCrossConstraintConflicts();
	}

	checkConstraint(stmt) {
		// Call subjects (e.g. contrast(a,b) >= 7) can only be checked, not assigned.
		if (stmt.subject && stmt.subject.type === "call") {
			if (stmt.op === "=" || stmt.op === "==") {
				this.err(
					`Cannot assign to function result '${astToString(stmt.subject)}' (line ${stmt.line}): ` +
					`use a comparison like >= instead`,
					stmt.line
				);
			}
			this.checkExpr(stmt.subject, stmt.line, astToString(stmt.subject));
			this.checkExpr(stmt.value, stmt.line, astToString(stmt.subject));
			return;
		}
		const target = stmt.target || stmt.subject;
		const key = target.parts.join(".");
		const list = this.assignments.get(key) || [];
		list.push({ op: stmt.op, value: stmt.value, line: stmt.line });
		this.assignments.set(key, list);

		// Type-check the value expression
		this.checkExpr(stmt.value, stmt.line, key);

		// Self-reference: target path appears inside its own value
		if (exprReferencesPath(stmt.value, target.parts)) {
			this.err(
				`Self-reference: '${key}' is defined in terms of itself`,
				stmt.line
			);
		}
	}

	checkExpr(node, line, context) {
		switch (node.type) {
			case "number":
			case "dimension":
			case "color":
			case "string":
			case "keyword":
			case "path":
				return this.kindOf(node);
			case "range": {
				const kMin = this.checkExpr(node.min, line, context);
				const kMax = this.checkExpr(node.max, line, context);
				if (kMin !== "number" && kMin !== "dimension") {
					this.err(`Range min must be numeric, got ${kMin} in '${context}'`, line);
				}
				if (kMax !== "number" && kMax !== "dimension") {
					this.err(`Range max must be numeric, got ${kMax} in '${context}'`, line);
				}
				// Constant range check
				const minC = constNumber(node.min);
				const maxC = constNumber(node.max);
				if (minC !== null && maxC !== null && minC > maxC) {
					this.err(`Empty range [${minC}, ${maxC}] in '${context}' (min > max)`, line);
				}
				return "range";
			}
			case "binary": {
				const lk = this.checkExpr(node.left, line, context);
				const rk = this.checkExpr(node.right, line, context);
				if (!isNumericKind(lk) || !isNumericKind(rk)) {
					this.err(
						`Operator '${node.op}' requires numeric operands, got ${lk} and ${rk} in '${context}'`,
						line
					);
				}
				if ((node.op === "/" ) && constNumber(node.right) === 0) {
					this.err(`Division by zero in '${context}'`, line);
				}
				return "number";
			}
			case "unary": {
				const k = this.checkExpr(node.operand, line, context);
				if (!isNumericKind(k)) {
					this.err(`Unary '-' requires numeric operand, got ${k} in '${context}'`, line);
				}
				return "number";
			}
			case "call": {
				return this.checkCall(node, line, context);
			}
			default:
				this.err(`Unknown AST node type '${node.type}' in '${context}'`, line);
				return "unknown";
		}
	}

	checkCall(node, line, context) {
		const spec = KNOWN_FUNCTIONS[node.name];
		if (!spec) {
			this.err(`Unknown function '${node.name}' in '${context}'`, line);
			return "unknown";
		}
		if (node.args.length !== spec.arity) {
			this.err(
				`Function '${node.name}' expects ${spec.arity} arguments, got ${node.args.length} in '${context}'`,
				line
			);
			return spec.returns;
		}
		node.args.forEach((arg, i) => {
			const want = spec.args[i];
			const got = this.checkExpr(arg, line, context);
			if (want !== "any" && got !== want && got !== "unknown" && got !== "path") {
				// 'path' kind means "deferred": the path's own type is unknown until solved.
				// Allow it; the solver will type-check concrete values.
				this.err(
					`Function '${node.name}' argument ${i + 1} expects ${want}, got ${got} in '${context}'`,
					line
				);
			}
		});
		return spec.returns;
	}

	kindOf(node) {
		switch (node.type) {
			case "number": return "number";
			case "dimension": return "dimension";
			case "color": return "color";
			case "string": return "string";
			case "keyword": return "keyword";
			case "path": return "path"; // deferred until solved
			default: return "unknown";
		}
	}

	checkCrossConstraintConflicts() {
		for (const [key, list] of this.assignments) {
			// Collect constant '=' assignments
			const constants = [];
			for (const a of list) {
				if (a.op === "=" || a.op === "==") {
					const c = constValue(a.value);
					if (c !== null) constants.push({ c, line: a.line });
				}
			}
			// Two different constants assigned to the same target
			for (let i = 1; i < constants.length; i++) {
				if (!valuesEqual(constants[0].c, constants[i].c)) {
					this.err(
						`Conflicting assignments to '${key}': ` +
						`${valueToString(constants[0].c)} vs ${valueToString(constants[i].c)}`,
						constants[i].line
					);
				}
			}

			// Bounds analysis for numeric targets
			let lower = null, lowerLine = null;
			let upper = null, upperLine = null;
			let inRange = null, inRangeLine = null;
			for (const a of list) {
				if (a.op === "in") {
					const mn = constNumber(a.value.min);
					const mx = constNumber(a.value.max);
					if (mn !== null && mx !== null) { inRange = [mn, mx]; inRangeLine = a.line; }
					continue;
				}
				const c = constNumber(a.value);
				if (c === null) continue;
				if (a.op === ">=" || a.op === ">") {
					if (lower === null || c > lower) { lower = c; lowerLine = a.line; }
				} else if (a.op === "<=" || a.op === "<") {
					if (upper === null || c < upper) { upper = c; upperLine = a.line; }
				} else if ((a.op === "=" || a.op === "==")) {
					// exact: both bounds
					lower = c; lowerLine = a.line;
					upper = c; upperLine = a.line;
				}
			}
			if (lower !== null && upper !== null && lower > upper) {
				this.err(
					`Impossible bounds on '${key}': lower ${lower} > upper ${upper}`,
					upperLine
				);
			}
			if (inRange !== null) {
				if (lower !== null && lower > inRange[1]) {
					this.err(`'${key}' lower bound ${lower} exceeds range max ${inRange[1]}`, lowerLine);
				}
				if (upper !== null && upper < inRange[0]) {
					this.err(`'${key}' upper bound ${upper} below range min ${inRange[0]}`, upperLine);
				}
				// exact constant outside range
				for (const a of list) {
					if (a.op === "=" || a.op === "==") {
						const c = constNumber(a.value);
						if (c !== null && (c < inRange[0] || c > inRange[1])) {
							this.err(`'${key}' = ${c} is outside range [${inRange[0]}, ${inRange[1]}]`, a.line);
						}
					}
				}
			}
		}
	}
}

/** Returns true for numeric-ish kinds. */
function isNumericKind(k) {
	return k === "number" || k === "dimension" || k === "path" || k === "unknown";
}

/**
 * Extracts a constant numeric value from an AST node, or null if not constant.
 * Handles numbers, dimensions (unitless value), and simple constant arithmetic.
 */
function constNumber(node) {
	if (!node) return null;
	switch (node.type) {
		case "number": return node.value;
		case "dimension": return node.value;
		case "unary":
			if (node.op === "-") {
				const v = constNumber(node.operand);
				return v === null ? null : -v;
			}
			return null;
		case "binary": {
			const l = constNumber(node.left);
			const r = constNumber(node.right);
			if (l === null || r === null) return null;
			switch (node.op) {
				case "+": return l + r;
				case "-": return l - r;
				case "*": return l * r;
				case "/": return r === 0 ? null : l / r;
				default: return null;
			}
		}
		default: return null;
	}
}

/**
 * Extracts a constant comparable value {kind, value} or null if not constant.
 */
function constValue(node) {
	if (!node) return null;
	switch (node.type) {
		case "number": return { kind: "number", value: node.value };
		case "dimension": return { kind: "dimension", value: node.value, unit: node.unit };
		case "color": return { kind: "color", value: node.hex };
		case "string": return { kind: "string", value: node.value };
		case "keyword": return { kind: "keyword", value: node.value };
		case "unary":
			if (node.op === "-") {
				const v = constNumber(node.operand);
				return v === null ? null : { kind: "number", value: -v };
			}
			return null;
		case "binary": {
			const v = constNumber(node);
			return v === null ? null : { kind: "number", value: v };
		}
		default: return null;
	}
}

function valuesEqual(a, b) {
	if (a.kind !== b.kind) return false;
	if (a.kind === "dimension") return a.value === b.value && a.unit === b.unit;
	return a.value === b.value;
}

function valueToString(v) {
	if (v.kind === "dimension") return `${v.value}${v.unit}`;
	return String(v.value);
}

/** True if the expression tree references the given dotted path. */
function exprReferencesPath(node, parts) {
	if (!node) return false;
	if (node.type === "path") {
		return node.parts.join(".") === parts.join(".");
	}
	const children = [];
	if (node.type === "binary") children.push(node.left, node.right);
	if (node.type === "unary") children.push(node.operand);
	if (node.type === "call") children.push(...node.args);
	if (node.type === "range") children.push(node.min, node.max);
	return children.some((c) => exprReferencesPath(c, parts));
}
